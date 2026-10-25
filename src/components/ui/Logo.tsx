// Logo ACX Flow : boîte 168x28, object-fit contain, fond clair.
// Le fichier SVG du logo n'existant pas dans le dépôt, on affiche le texte
// "ACX Flow" dans la boîte. Aucun symbole, aucun slogan.

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`logo-box ${className}`}>
      <span className="logo-placeholder">ACX Flow</span>
    </div>
  );
}
