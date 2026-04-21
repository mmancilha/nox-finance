export const BANKS = [
  {
    id: 'nubank',
    name: 'Nubank',
    logo: (
      <svg viewBox="0 0 48 48" className="h-10 w-10">
        <circle cx="24" cy="24" r="24" fill="#820AD1" />
        <text
          x="24"
          y="31"
          textAnchor="middle"
          fill="white"
          fontSize="20"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          N
        </text>
      </svg>
    ),
  },
  {
    id: 'itau',
    name: 'Itaú',
    logo: (
      <svg viewBox="0 0 48 48" className="h-10 w-10">
        <circle cx="24" cy="24" r="24" fill="#EC7000" />
        <text
          x="24"
          y="30"
          textAnchor="middle"
          fill="white"
          fontSize="13"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          itaú
        </text>
      </svg>
    ),
  },
  {
    id: 'santander',
    name: 'Santander',
    logo: (
      <svg viewBox="0 0 48 48" className="h-10 w-10">
        <circle cx="24" cy="24" r="24" fill="#EC0000" />
        <text
          x="24"
          y="31"
          textAnchor="middle"
          fill="white"
          fontSize="19"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          S
        </text>
      </svg>
    ),
  },
  {
    id: 'bradesco',
    name: 'Bradesco',
    logo: (
      <svg viewBox="0 0 48 48" className="h-10 w-10">
        <circle cx="24" cy="24" r="24" fill="#CC092F" />
        <text
          x="24"
          y="31"
          textAnchor="middle"
          fill="white"
          fontSize="19"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          B
        </text>
      </svg>
    ),
  },
  {
    id: 'bb',
    name: 'Banco do Brasil',
    logo: (
      <svg viewBox="0 0 48 48" className="h-10 w-10">
        <circle cx="24" cy="24" r="24" fill="#005FAD" />
        <text
          x="24"
          y="30"
          textAnchor="middle"
          fill="#F9C700"
          fontSize="13"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          BB
        </text>
      </svg>
    ),
  },
  {
    id: 'inter',
    name: 'Inter',
    logo: (
      <svg viewBox="0 0 48 48" className="h-10 w-10">
        <circle cx="24" cy="24" r="24" fill="#FF7A00" />
        <text
          x="24"
          y="30"
          textAnchor="middle"
          fill="white"
          fontSize="12"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          inter
        </text>
      </svg>
    ),
  },
] as const;
