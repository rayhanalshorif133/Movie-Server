import os
import csv
import zipfile
import xml.sax.saxutils as saxutils

data_files = [
    ("movies", "data/movies_rows.csv"),
    ("games", "data/games_rows.csv"),
    ("game_type", "data/game_type_rows.csv"),
    ("gmails", "data/gmails_rows.csv"),
    ("gmail_inventory", "data/gmail_inventory_rows.csv"),
    ("hitlogs", "data/hitlogs_rows.csv"),
    ("galleries", "data/galleries_rows.csv"),
]

sheets_data = []

# Read CSV files from data/
for sheet_name, fpath in data_files:
    if os.path.exists(fpath):
        with open(fpath, mode="r", encoding="utf-8") as f:
            reader = csv.reader(f)
            header = next(reader)
            rows = list(reader)
            sheets_data.append({
                "name": sheet_name,
                "headers": header,
                "rows": rows
            })
            print(f"Loaded '{sheet_name}': {len(rows)} rows, {len(header)} columns")
    else:
        print(f"File not found: {fpath}")

# Add auth sheet
auth_sheet = {
    "name": "auth",
    "headers": ["platform", "role", "email", "password", "notes"],
    "rows": [
        ["Movies-Server Admin", "Super Admin", "rayhan@gmail.com", "admin123", "Default Admin Login (/login)"],
        ["Movies-Server Mock Auth", "Admin User", "admin@movieserver.com", "admin123", "Mock Auth User"],
        ["Google Drive Inventory", "Storage Account 1", "rayhanalshorif2@gmail.com", "Active", "Asset storage account"],
        ["Google Drive Inventory", "Storage Account 2", "rayhanalshorifmovie28@gmail.com", "Active", "Asset storage account"]
    ]
}
sheets_data.append(auth_sheet)
print(f"Loaded 'auth': {len(auth_sheet['rows'])} rows")

def col_letter(n):
    result = ""
    while n >= 0:
        result = chr(n % 26 + 65) + result
        n = n // 26 - 1
    return result

content_types_entries = []
workbook_sheets = []
workbook_rels = []

for idx, s in enumerate(sheets_data):
    sheet_num = idx + 1
    sname = s["name"]
    content_types_entries.append(
        f'<Override PartName="/xl/worksheets/sheet{sheet_num}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
    )
    workbook_sheets.append(
        f'<sheet name="{saxutils.escape(sname)}" sheetId="{sheet_num}" r:id="rId{sheet_num}"/>'
    )
    workbook_rels.append(
        f'<Relationship Id="rId{sheet_num}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{sheet_num}.xml"/>'
    )

content_types_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  {' '.join(content_types_entries)}
</Types>"""

root_rels_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>"""

workbook_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    {' '.join(workbook_sheets)}
  </sheets>
</workbook>"""

workbook_rels_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  {' '.join(workbook_rels)}
</Relationships>"""

excel_path = "movie-server.xlsx"
with zipfile.ZipFile(excel_path, "w", zipfile.ZIP_DEFLATED) as zf:
    zf.writestr("[Content_Types].xml", content_types_xml)
    zf.writestr("_rels/.rels", root_rels_xml)
    zf.writestr("xl/workbook.xml", workbook_xml)
    zf.writestr("xl/_rels/workbook.xml.rels", workbook_rels_xml)

    for idx, s in enumerate(sheets_data):
        sheet_num = idx + 1
        headers = s["headers"]
        rows = s["rows"]
        
        sheet_xml_rows = []
        
        # Header row (row 1)
        header_cells = []
        for col_idx, h in enumerate(headers):
            c_ref = f"{col_letter(col_idx)}1"
            header_cells.append(f'<c r="{c_ref}" t="inlineStr"><is><t>{saxutils.escape(str(h))}</t></is></c>')
        sheet_xml_rows.append(f'<row r="1">{"".join(header_cells)}</row>')
        
        # Data rows
        for row_idx, r_data in enumerate(rows):
            r_num = row_idx + 2
            cells = []
            for col_idx in range(len(headers)):
                val = r_data[col_idx] if col_idx < len(r_data) else ""
                c_ref = f"{col_letter(col_idx)}{r_num}"
                cells.append(f'<c r="{c_ref}" t="inlineStr"><is><t>{saxutils.escape(str(val))}</t></is></c>')
            sheet_xml_rows.append(f'<row r="{r_num}">{"".join(cells)}</row>')
            
        max_col_letter = col_letter(len(headers) - 1)
        max_row = len(rows) + 1
        dimension = f"A1:{max_col_letter}{max_row}"
        
        sheet_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="{dimension}"/>
  <sheetData>
    {''.join(sheet_xml_rows)}
  </sheetData>
</worksheet>"""
        zf.writestr(f"xl/worksheets/sheet{sheet_num}.xml", sheet_xml)

print(f"'{excel_path}' successfully built with {len(sheets_data)} sheets!")

