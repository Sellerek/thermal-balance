# Bilans ciepła

Interaktywny kalkulator energooszczędnego domu. Ustawiasz parametry domu (ocieplenie, okna, wentylację, źródło ciepła, fotowoltaikę), a aplikacja pokazuje dom w „termowizji” i liczy:

- zapotrzebowanie na ciepło do ogrzewania (kWh/m²·rok) i orientacyjną klasę (A+ … G, progi NF15 / NF40),
- roczny koszt ogrzewania, emisję CO₂ i moc potrzebną do doboru źródła ciepła,
- którędy ucieka ciepło (ściany, dach, podłoga, okna, mostki termiczne, wentylacja),
- które modernizacje dadzą największą oszczędność, każda policzona osobno, z podglądem „po zmianie”.

Ustawienia zapisują się w adresie strony, więc wariantem można się podzielić linkiem.

## Model

Uproszczony sezonowy bilans cieplny (w duchu PN-EN ISO 13790 / 12831): straty przez przegrody (U × A), mostki termiczne i wentylację, przez stopniodni strefy klimatycznej, minus zyski od słońca i ludzi. Wszystkie założenia (współczynniki, ceny, sprawności) są nazwane w [`src/lib/model.js`](src/lib/model.js), a ceny energii można zmienić w aplikacji.

To szacunek do porównywania wariantów, a nie świadectwo charakterystyki energetycznej ani projekt instalacji.

## Technologia

SvelteKit 2 (Svelte 5, runes), statyczny build (`adapter-static`), SVG + CSS do wizualizacji, Vitest do testów modelu. Bez zewnętrznych bibliotek do wykresów.

```sh
npm install
npm run dev     # podgląd
npm test        # testy modelu
npm run build   # statyczna strona w build/
```

Autor: [Krzysztof Pietruszka](https://photodev.pl)
