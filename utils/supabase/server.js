import { dbStore, dummyAuth } from '@/utils/dummyData';

const cache = {
  data: {},
  timestamp: {}
};
const CACHE_TTL_MS = 5000; // 5 seconds cache to avoid duplicate calls in parallel

const FALLBACK_GOOGLE_SHEET_API_URL = "https://script.google.com/macros/s/AKfycbyopn16A3wM7tulOBRs18t6Xgb2_Bo4k_n_W__4u-r13VTdjHxy2uIP1e1Wvjh9c0ZptQ/exec";

function getApiUrl() {
  return process.env.NEXT_GOOGLE_SHEET_API_URL || FALLBACK_GOOGLE_SHEET_API_URL;
}

export async function fetchSheetData(sheetName) {
  const now = Date.now();
  if (cache.data[sheetName] && (now - (cache.timestamp[sheetName] || 0) < CACHE_TTL_MS)) {
    return cache.data[sheetName];
  }

  const apiUrl = getApiUrl();
  if (!apiUrl) return null;

  try {
    const res = await fetch(`${apiUrl}?sheet=${sheetName}&action=getAll`, {
      cache: 'no-store'
    });
    const result = await res.json();
    if (result && result.status === 'success' && Array.isArray(result.data)) {
      const normalized = result.data.map(item => ({
        ...item,
        url: item.url || (item.file_id ? `https://drive.google.com/file/d/${item.file_id}/view` : '#'),
        movie_source: item.movie_source || 'drive01@gmail.com',
        part_name: item.part_name || 'Full Movie'
      }));
      cache.data[sheetName] = normalized;
      cache.timestamp[sheetName] = now;
      if (dbStore[sheetName]) {
        dbStore[sheetName] = [...normalized];
      }
      return normalized;
    }
  } catch (err) {
    console.error(`Error fetching sheet [${sheetName}]:`, err);
  }
  return null;
}

export async function mutateSheet(sheetName, action, payload) {
  const apiUrl = getApiUrl();
  if (!apiUrl) {
    console.error("NEXT_GOOGLE_SHEET_API_URL is missing!");
    return null;
  }

  try {
    cache.data[sheetName] = null; // Invalidate cache immediately on mutation
    cache.timestamp[sheetName] = 0;
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        sheet: sheetName,
        action: action,
        ...payload
      }),
      redirect: 'follow'
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.error(`Error mutating sheet [${sheetName}]:`, err);
  }
  return null;
}

class MockQueryBuilder {
  constructor(table) {
    this.table = table;
    this.filters = [];
    this.selectedColumns = '*';
    this.countOption = null;
    this.isHead = false;
    this.isSingle = false;
    this.isMaybeSingle = false;
    this.orderByCol = null;
    this.ascending = true;
    this.rangeFrom = null;
    this.rangeTo = null;
    this.pendingInsert = null;
    this.pendingUpsert = null;
    this.pendingUpdate = null;
    this.pendingDelete = false;
  }

  select(columns = '*', options = {}) {
    this.selectedColumns = columns;
    if (options && options.count) this.countOption = options.count;
    if (options && options.head) this.isHead = options.head;
    return this;
  }

  eq(column, value) {
    this.filters.push({ type: 'eq', column, value });
    return this;
  }

  ilike(column, pattern) {
    this.filters.push({ type: 'ilike', column, pattern });
    return this;
  }

  not(column, operator, value) {
    this.filters.push({ type: 'not', column, operator, value });
    return this;
  }

  is(column, value) {
    this.filters.push({ type: 'is', column, value });
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.orderByCol = column;
    this.ascending = ascending;
    return this;
  }

  range(from, to) {
    this.rangeFrom = from;
    this.rangeTo = to;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  limit(count) {
    this.rangeFrom = 0;
    this.rangeTo = Math.max(0, count - 1);
    return this;
  }

  insert(rows) {
    this.pendingInsert = rows;
    return this;
  }

  upsert(rows, options = {}) {
    this.pendingUpsert = { rows, options };
    return this;
  }

  update(updates) {
    this.pendingUpdate = updates;
    return this;
  }

  delete() {
    this.pendingDelete = true;
    return this;
  }

  async then(resolve, reject) {
    try {
      // Invalidate cache for mutations to ensure fresh live data
      if (this.pendingDelete || this.pendingUpdate || this.pendingInsert || this.pendingUpsert) {
        cache.data[this.table] = null;
        cache.timestamp[this.table] = 0;
      }

      // 1. Fetch live data from Google Sheets API, fallback to dbStore
      let sourceData = await fetchSheetData(this.table);
      if (!sourceData || sourceData.length === 0) {
        sourceData = dbStore[this.table] || [];
      }
      let data = sourceData.map(item => ({ ...item }));

      // 2. Handle Insert Mutation (Awaited for serverless environments)
      if (this.pendingInsert) {
        const rows = Array.isArray(this.pendingInsert) ? this.pendingInsert : [this.pendingInsert];
        const insertPromises = [];
        for (const r of rows) {
          const item = {
            id: r.id || String(Date.now()),
            created_at: r.created_at || new Date().toISOString(),
            ...r
          };
          data.push(item);
          if (dbStore[this.table]) dbStore[this.table].push(item);
          insertPromises.push(mutateSheet(this.table, 'add', { data: item }));
        }
        await Promise.all(insertPromises);
      }

      // 2.1 Handle Upsert Mutation (Awaited for serverless environments)
      if (this.pendingUpsert) {
        const rows = Array.isArray(this.pendingUpsert.rows)
          ? this.pendingUpsert.rows
          : [this.pendingUpsert.rows];
        const onConflict = this.pendingUpsert.options?.onConflict || 'name';
        const upsertPromises = [];
        const resultRows = [];

        for (const row of rows) {
          const conflictVal = row[onConflict] !== undefined ? row[onConflict] : row.id;
          const existingIndex = data.findIndex(item => {
            if (conflictVal === undefined || conflictVal === null) return false;
            return String(item[onConflict] || item.id || '').toLowerCase().trim() ===
                   String(conflictVal).toLowerCase().trim();
          });

          if (existingIndex >= 0) {
            const existingId = data[existingIndex].id;
            const updated = { ...data[existingIndex], ...row };
            data[existingIndex] = updated;
            resultRows.push(updated);
            if (dbStore[this.table]) {
              dbStore[this.table] = dbStore[this.table].map(item =>
                String(item.id) === String(existingId) ? updated : item
              );
            }
            upsertPromises.push(mutateSheet(this.table, 'update', { id: existingId, data: row }));
          } else {
            const newItem = {
              id: row.id || String(Date.now()),
              created_at: row.created_at || new Date().toISOString(),
              ...row
            };
            data.push(newItem);
            resultRows.push(newItem);
            if (dbStore[this.table]) dbStore[this.table].push(newItem);
            upsertPromises.push(mutateSheet(this.table, 'add', { data: newItem }));
          }
        }
        await Promise.all(upsertPromises);

        if (this.isSingle) {
          return resolve({ data: resultRows[0] || null, error: null });
        }
        return resolve({ data: resultRows, error: null });
      }

      // 3. Apply Filters
      for (const f of this.filters) {
        if (f.type === 'eq') {
          data = data.filter(item => {
            if (item[f.column] === undefined || item[f.column] === null) return false;
            return String(item[f.column]).trim().toLowerCase() === String(f.value).trim().toLowerCase();
          });
        } else if (f.type === 'ilike') {
          const cleanPattern = String(f.pattern || '').replace(/%/g, '').toLowerCase();
          data = data.filter(item => {
            const val = item[f.column];
            if (!val) return false;
            return String(val).toLowerCase().includes(cleanPattern);
          });
        } else if (f.type === 'not') {
          if (f.operator === 'is' && f.value === null) {
            data = data.filter(item => item[f.column] !== null && item[f.column] !== undefined && item[f.column] !== '');
          } else {
            data = data.filter(item => item[f.column] !== f.value);
          }
        } else if (f.type === 'is') {
          data = data.filter(item => {
            if (f.value === null) {
              return item[f.column] === null || item[f.column] === undefined;
            }
            return item[f.column] === f.value;
          });
        }
      }

      // 4. Handle Update Mutation (Awaited for serverless environments)
      if (this.pendingUpdate) {
        const updatePromises = data.map(d =>
          mutateSheet(this.table, 'update', { id: d.id, data: this.pendingUpdate })
        );
        await Promise.all(updatePromises);
        data = data.map(d => ({ ...d, ...this.pendingUpdate }));
        if (dbStore[this.table]) {
          dbStore[this.table] = dbStore[this.table].map(item => {
            const match = data.find(d => String(d.id) === String(item.id));
            return match ? { ...item, ...this.pendingUpdate } : item;
          });
        }
      }

      // 5. Handle Delete Mutation (Awaited for serverless environments)
      if (this.pendingDelete) {
        const deletePromises = data.map(d =>
          mutateSheet(this.table, 'delete', { id: d.id, drive_id: d.drive_id })
        );
        await Promise.all(deletePromises);
        if (dbStore[this.table]) {
          const deletedIds = new Set(data.map(d => String(d.id)));
          dbStore[this.table] = dbStore[this.table].filter(item => !deletedIds.has(String(item.id)));
        }
        data = [];
      }

      // 6. Apply Sorting
      if (this.orderByCol) {
        const col = this.orderByCol;
        const asc = this.ascending;
        data.sort((a, b) => {
          const aVal = a[col] || '';
          const bVal = b[col] || '';
          if (aVal < bVal) return asc ? -1 : 1;
          if (aVal > bVal) return asc ? 1 : -1;
          return 0;
        });
      }

      const totalCount = data.length;
      let result = [...data];

      // 7. Apply Pagination Range
      if (this.rangeFrom !== null && this.rangeTo !== null) {
        result = result.slice(this.rangeFrom, this.rangeTo + 1);
      }

      if (this.isSingle) {
        const singleItem = result[0] || null;
        return resolve({
          data: singleItem,
          count: singleItem ? 1 : 0,
          error: singleItem ? null : { message: 'Row not found', code: 'PGRST116' }
        });
      }

      if (this.isMaybeSingle) {
        return resolve({
          data: result[0] || null,
          count: result[0] ? 1 : 0,
          error: null
        });
      }

      return resolve({
        data: this.isHead ? null : result,
        count: totalCount,
        error: null
      });

    } catch (err) {
      console.error(`MockQueryBuilder error on [${this.table}]:`, err);
      return resolve({ data: null, count: 0, error: { message: err.message } });
    }
  }
}

export async function createClient() {
  return {
    from: (tableName) => new MockQueryBuilder(tableName),
    auth: {
      signInWithPassword: async ({ email, password }) => {
        const user = dummyAuth?.find(
          (u) => u.email?.toLowerCase() === email?.toLowerCase() && u.password === password
        );
        if (user || (email === 'rayhan@gmail.com' && password === 'admin123')) {
          return { data: { user: user || { email, role: 'Super Admin' } }, error: null };
        }
        return { data: { user: null }, error: { message: 'Invalid email or password' } };
      },
      signOut: async () => {
        return { error: null };
      },
      getUser: async () => {
        return { data: { user: { email: 'rayhan@gmail.com', role: 'Super Admin' } }, error: null };
      }
    }
  };
}
