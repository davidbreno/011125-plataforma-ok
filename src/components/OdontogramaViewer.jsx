import React, { useState, useEffect, useMemo, useRef } from "react";

// Componente para exibir um odontograma HTML (público) e permitir seleção de dentes
// Contrato:
// - props.tipoInicial: 'permanente' | 'deciduo' (default: 'permanente')
// - props.selectedTeeth: number[] (seleção controlada externamente, opcional)
// - props.onChangeSelectedTeeth: (numbers[]) => void (callback ao alterar seleção)
const OdontogramaViewer = ({
  tipoInicial = "permanente",
  selectedTeeth = [],
  onChangeSelectedTeeth,
}) => {
  const [tipo, setTipo] = useState(tipoInicial);
  const iframeRef = useRef(null);

  const path = useMemo(() => (
    tipo === "permanente"
      ? "/odontogramas/permanente/permanente.html"
      : "/odontogramas/deciduo/deciduo.html"
  ), [tipo]);

  // Prepara o iframe: injeta estilo, cliques e sincroniza seleção
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        // Estilo de destaque dentro do iframe
        if (!doc.getElementById('og-style')) {
          const style = doc.createElement('style');
          style.id = 'og-style';
          style.textContent = `.og-selected{outline:2px solid #2d8cff;outline-offset:2px;background:rgba(45,140,255,.12)}`;
          doc.head.appendChild(style);
        }

        // Delegação de cliques
        const clickHandler = (e) => {
          const targetEl = e.target.closest('[data-tooth]');
          if (!targetEl) return;
          const n = parseInt(targetEl.getAttribute('data-tooth'), 10);
          if (!n) return;
          const exists = selectedTeeth?.includes(n);
          const next = exists
            ? (selectedTeeth || []).filter(t => t !== n)
            : [...(selectedTeeth || []), n];
          onChangeSelectedTeeth && onChangeSelectedTeeth(next.sort((a,b)=>a-b));
        };
        doc.addEventListener('click', clickHandler);
        // Guardar para remover depois
        iframe._ogCleanup = () => doc.removeEventListener('click', clickHandler);

        // Sincronizar seleção inicial
        const sync = () => {
          const all = doc.querySelectorAll('[data-tooth]');
          all.forEach((node) => {
            const n = parseInt(node.getAttribute('data-tooth'), 10);
            node.classList.toggle('og-selected', !!selectedTeeth?.includes(n));
          });
        };
        sync();
      } catch (err) {
        console.error('Erro ao inicializar iframe do odontograma:', err);
      }
    };

    iframe.addEventListener('load', handleLoad);
    return () => {
      try { iframe._ogCleanup && iframe._ogCleanup(); } catch { /* noop */ }
      iframe.removeEventListener('load', handleLoad);
    };
  }, [selectedTeeth, onChangeSelectedTeeth, path]);

  // Quando a seleção mudar, reflita no iframe (se já carregado)
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument;
      if (!doc) return;
      const all = doc.querySelectorAll('[data-tooth]');
      all.forEach((node) => {
        const n = parseInt(node.getAttribute('data-tooth'), 10);
        node.classList.toggle('og-selected', !!selectedTeeth?.includes(n));
      });
    } catch { /* noop */ }
  }, [selectedTeeth]);

  return (
    <div style={{ padding: "12px", textAlign: "center" }}>
      <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:12 }}>
        <button
          type="button"
          onClick={() => setTipo("permanente")}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: '1px solid var(--color-border)',
            backgroundColor: tipo === "permanente" ? "var(--color-primary)" : "var(--color-bg)",
            color: tipo === "permanente" ? "#0b111b" : 'var(--color-text)',
            cursor: "pointer"
          }}
        >
          Permanentes
        </button>
        <button
          type="button"
          onClick={() => setTipo("deciduo")}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: '1px solid var(--color-border)',
            backgroundColor: tipo === "deciduo" ? "var(--color-primary)" : "var(--color-bg)",
            color: tipo === "deciduo" ? "#0b111b" : 'var(--color-text)',
            cursor: "pointer"
          }}
        >
          Decíduos
        </button>
      </div>

      <div style={{display:'flex', justifyContent:'center'}}>
        <iframe
          ref={iframeRef}
          key={path}
          src={path}
          title="Odontograma"
          style={{
            width: '100%',
            maxWidth: 980,
            height: 560,
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            background: 'var(--color-bg)',
            boxShadow: '0 0 10px rgba(0,0,0,0.08)'
          }}
        />
      </div>
    </div>
  );
};

export default OdontogramaViewer;
