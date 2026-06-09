import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

bordro_section = """        {/* Bordro */}
        {currentView === 'bordro' && (
          ['employee', 'user'].includes(effectiveAppRole) ? (
            <div className="space-y-6">
              <BordroList
                bordrolar={bordrolar}
                onView={handleViewBordro}
                isEmployeeView={true}
                onEdit={() => {}}
                onDelete={() => {}}
                onImport={() => {}}
                onSendForApproval={() => {}}
              />
            </div>
          ) : (
            <BordroMain
              employees={employees}
              onSaveBordro={handleSaveBordro}
              bordrolar={bordrolar}
              onEdit={handleEditBordro}
              onDelete={handleDeleteBordro}
              onView={handleViewBordro}
              onSendForApproval={handleSendBordroForApproval}
            />
          )
        )}"""

content = re.sub(
    r'\{\/\*\s*Bordro\s*\*\/\}.*?<BordroMain.*?\/>\s*\)}',
    bordro_section,
    content,
    flags=re.DOTALL
)

responsive_sidebar_setup = """  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (currentView === 'chat') {"""

content = content.replace("  useEffect(() => {\n    if (currentView === 'chat') {", responsive_sidebar_setup)

main_start = """    return (
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
        <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">H</div>
            <h1 className="text-xl font-bold text-gray-800">Humanius</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 -mr-2 text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
"""
content = content.replace("    return (\n      <main className=\"flex-1 overflow-y-auto p-6 bg-gray-50\">", main_start)
content = content.replace("      </main>\n    );\n  };\n", "        </div>\n      </main>\n    );\n  };\n")

sidebar_render = """      <div className={`md:block ${mobileMenuOpen ? 'block fixed inset-0 z-50' : 'hidden md:relative z-40'}`}>
        {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />}
        <AppSectionErrorBoundary
          resetKey={currentView}
          fallback={
            <aside className="w-64 bg-white border-r border-gray-200 p-5 sticky top-0 h-screen overflow-y-auto shadow-sm">
              <h2 className="text-sm font-semibold text-gray-800">Menü yüklenemedi</h2>
            </aside>
          }
        >
          <div className="relative h-full bg-white w-64 md:w-auto">
            <Sidebar
              currentView={currentView}
              onViewChange={(v) => { setCurrentView(v); setMobileMenuOpen(false); }}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </div>
        </AppSectionErrorBoundary>
      </div>"""

content = re.sub(
    r'<AppSectionErrorBoundary[^>]*fallback=\{\s*<aside.*?</aside>\s*\}\s*>\s*<Sidebar[^>]*/>\s*</AppSectionErrorBoundary>',
    sidebar_render,
    content,
    flags=re.DOTALL
)

# Fix BordroList import if missing
if 'import BordroList from' not in content:
    content = content.replace("import BordroMain from './components/BordroMain';", "import BordroMain from './components/BordroMain';\nimport BordroList from './components/BordroList';")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)


with open('src/components/BordroList.tsx', 'r', encoding='utf-8') as f:
    bl_content = f.read()

bl_content = bl_content.replace("interface BordroListProps {", "interface BordroListProps {\n  isEmployeeView?: boolean;")
bl_content = bl_content.replace("  onSendForApproval,\n}) => {", "  onSendForApproval,\n  isEmployeeView = false,\n}) => {")

bl_content = bl_content.replace("{/* CSV import */}", "{/* CSV import */}\n          {!isEmployeeView && (")
bl_content = bl_content.replace("</label>\n        </div>", "</label>\n          )}\n        </div>")

bl_content = bl_content.replace('<th className="px-4 py-3 text-left">İşlemler</th>', '{!isEmployeeView && <th className="px-4 py-3 text-left">İşlemler</th>}')

actions_block = """<td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onView(bordro)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Görüntüle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {!isEmployeeView && (
                        <>
                          <button
                            onClick={() => onEdit(bordro)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onSendForApproval(bordro)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Onaya Gönder"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Bu bordroyu silmek istediğinize emin misiniz?')) {
                                onDelete(bordro.id);
                              }
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>"""

bl_content = re.sub(
    r'<td className="px-4 py-3">\s*<div className="flex items-center gap-1">\s*<button[^>]*Görüntüle.*?</button>\s*<button[^>]*Düzenle.*?</button>\s*<button[^>]*Onaya Gönder.*?</button>\s*<button[^>]*Sil.*?</button>\s*</div>\s*</td>',
    actions_block,
    bl_content,
    flags=re.DOTALL
)

bl_content = bl_content.replace("<td />\n              </tr>\n            </tfoot>", "{!isEmployeeView && <td />}\n              </tr>\n            </tfoot>")

with open('src/components/BordroList.tsx', 'w', encoding='utf-8') as f:
    f.write(bl_content)
