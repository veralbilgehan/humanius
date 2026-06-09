import { useEffect } from 'react';

export const ContextualHelp = () => {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Eğer input, textarea veya contenteditable bir alandaysak karışma (kopyala/yapıştır çalışsın)
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable
      ) {
        return;
      }

      // 1. Önce kullanıcının fareyle seçtiği bir metin var mı ona bakalım
      let query = window.getSelection()?.toString().trim();

      // 2. Eğer seçili metin yoksa, tıklanan elementin (veya en yakın ebeveynin) içindeki anlamlı metni alalım
      if (!query) {
        // SVG veya iconlara tıklandıysa ebeveyne çık
        const closestTextElement = target.closest('[data-help-keyword]') as HTMLElement;
        if (closestTextElement) {
          query = closestTextElement.dataset.helpKeyword?.trim() || '';
        } else {
          // Elementin kendi metni veya parent'ın metni (çok uzun değilse)
          // nodeType 3 is text node, if clicked exactly on text.
          const textContent = target.innerText || target.textContent;
          if (textContent) {
             // Sadece ilk satırı veya kısa bir kısmını al ki devasa paragrafları aratmayalım
             const firstLine = textContent.split('\n')[0].trim();
             // Sadece 3-30 karakter arası anlamlı kelimeleri al
             if (firstLine.length >= 3 && firstLine.length <= 50) {
                query = firstLine;
             }
          }
        }
      }

      // Eğer hala query yoksa bile kılavuzu genel açsın (çünkü "boş alana sağ tık" senaryosu da var)
      // Ama eğer query varsa, ?q parametresiyle aç
      e.preventDefault(); // Varsayılan menüyü engelle
      
      const searchUrl = query 
        ? `/kullanim-kilavuzu.html?q=${encodeURIComponent(query)}`
        : `/kullanim-kilavuzu.html`;

      // Pop-up olarak aç (ekranın ortasında veya uygun bir boyutta)
      window.open(searchUrl, 'KullanimKilavuzu', 'width=1024,height=768,left=100,top=100');
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return null; // Arayüzü olmayan (invisible) bir logic component
};
