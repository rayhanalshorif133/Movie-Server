import { dbStore } from '@/utils/dummyData';

const cache = {
  data: {},
  timestamp: {}
};
const CACHE_TTL_MS = 5000; // 5 seconds cache to avoid duplicate calls in parallel

export async function fetchSheetData(sheetName) {
  const now = Date.now();
  if (cache.data[sheetName] && (now - (cache.timestamp[sheetName] || 0) < CACHE_TTL_MS)) {
    return cache.data[sheetName];
  }

  const apiUrl = process.env.NEXT_GOOGLE_SHEET_API_URL;
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
  const apiUrl = process.env.NEXT_GOOGLE_SHEET_API_URL;
  if (!apiUrl) return null;

  try {
    cache.data[sheetName] = null; // Invalidate cache immediately on mutation
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        sheet: sheetName,
        action: action,
        ...payload
      })
    });
    return await res.json();
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

  insert(rows) {
    this.pendingInsert = rows;
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
      // 1. Fetch live data from Google Sheets API, fallback to dbStore
      let sourceData = await fetchSheetData(this.table);
      if (!sourceData || sourceData.length === 0) {
        sourceData = dbStore[this.table] || [];
      }
      let data = sourceData.map(item => ({ ...item }));

      // 2. Handle Insert Mutation
      if (this.pendingInsert) {
        const rows = Array.isArray(this.pendingInsert) ? this.pendingInsert : [this.pendingInsert];
        for (const r of rows) {
          const item = {
            id: r.id || String(Date.now()),
            created_at: r.created_at || new Date().toISOString(),
            ...r
          };
          data.push(item);
          if (dbStore[this.table]) dbStore[this.table].push(item);
          mutateSheet(this.table, 'add', { data: item }).catch(() => {});
        }
      }

      // 3. Apply Filters
      for (const f of this.filters) {
        if (f.type === 'eq') {
          data = data.filter(item => {
            if (item[f.column] === undefined) return false;
            return String(item[f.column]).toLowerCase() === String(f.value).toLowerCase();
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

      // 4. Handle Update Mutation
      if (this.pendingUpdate) {
        for (const d of data) {
          mutateSheet(this.table, 'update', { id: d.id, data: this.pendingUpdate }).catch(() => {});
        }
        data = data.map(d => ({ ...d, ...this.pendingUpdate }));
      }

      // 5. Handle Delete Mutation
      if (this.pendingDelete) {
        for (const d of data) {
          mutateSheet(this.table, 'delete', { id: d.id }).catch(() => {});
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

      if (this.isHead) {
        return resolve({
          data: null,
          count: totalCount,
          error: null
        });
      }

      return resolve({
        data: result,
        count: totalCount,
        error: null
      });
    } catch (err) {
      return resolve({
        data: [],
        count: 0,
        error: { message: err.message }
      });
    }
  }
}

const mockAuth = {
  async getUser() {
    return {
      data: {
        user: {
          id: 'mock-admin-id',
          email: 'admin@movieserver.com',
          user_metadata: { role: 'admin' }
        }
      },
      error: null
    };
  },
  async signInWithPassword({ email, password }) {
    return {
      data: {
        user: {
          id: 'mock-admin-id',
          email: email || 'admin@movieserver.com'
        },
        session: { access_token: 'mock-token' }
      },
      error: null
    };
  },
  async signOut() {
    return { error: null };
  }
};

export async function createClient() {
  return {
    from(tableName) {
      return new MockQueryBuilder(tableName);
    },
    auth: mockAuth
  };
}
