import Image from 'next/image';

// Logo ACX Flow : utilise le fichier SVG officiel
export default function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/logo-acx-flow.svg"
        alt="ACX Flow"
        width={120}
        height={36}
        className="h-9 w-auto block"
      />
    </div>
  );
}