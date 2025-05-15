# Serialize Typst Value

This is a simple package that provides a way to serialize JavaScript objects to Typst values. It is useful for converting JavaScript objects into a format that can be inserted into Typst documents.

## Installation

```sh
npm install serialize-typst-value
```

## Usage

```javascript
import serializeTypstValue from 'serialize-typst-value'

const obj = {
  name: 'John Doe',
  age: 30,
  isActive: true,
  hobbies: ['reading', 'gaming'],
  address: {
    street: '123 Main St',
    city: 'Anytown',
    country: 'USA'
  }
}

console.log(serializeTypstValue(obj))
// With added whitespace:
// (
//   "name": "John Doe",
//   "age": 30,
//   "isActive": true,
//   "hobbies": ("reading", "gaming"),
//   "address": ("street": "123 Main St", "city": "Anytown", "country": "USA")
// )
```

## Details

Values are serialized in the following manner:

- `null` is serialized as [`none`](https://typst.app/docs/reference/foundations/none/)
- `boolean` is serialized as [`true` or `false`](https://typst.app/docs/reference/foundations/bool/)
- `number` is serialized as either an [`int`](https://typst.app/docs/reference/foundations/int/) or a [`float`](https://typst.app/docs/reference/foundations/float/)
  - `NaN` is serialized as [`float.nan`](https://typst.app/docs/reference/foundations/float/)
  - `Infinity` is serialized as [`float.inf`](https://typst.app/docs/reference/foundations/float/)
  - `-Infinity` is serialized as [`-float.inf`](https://typst.app/docs/reference/foundations/float/)
- `BigInt` is serialized as an [`int`](https://typst.app/docs/reference/foundations/int/)
- `string` are serialized as a [`str`](https://typst.app/docs/reference/foundations/str/)
- `Function` and `Symbol` will throw an `UnexpectedValueError`
- `undefined` will be ignored in object values, and will throw an `UnexpectedValueError` in any other place
- [`Temporal.PlainDate`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainDate), [`Temporal.PlainDateTime`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainDateTime), and [`Temporal.PlainTime`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainTime) is serialized as [`datetime`](https://typst.app/docs/reference/foundations/datetime/)
- `Date`, `Map`, `Set`, and `RegExp` is not yet supported, but might be included in a future minor version, it's currently undefined behavior to try and serialize them
