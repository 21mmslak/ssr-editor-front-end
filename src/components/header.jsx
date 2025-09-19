export default function Header() {
  return (
    <header className="h-[100px] bg-black text-white flex items-center justify-center fixed top-0 left-0 w-full border-b-2 border-green-700 z-40">
        <ul className="list-none">
            <li>
            <a href="/" className="no-underline">Hem</a>
            </li>
        </ul>
    </header>
  );
}