function isPlainDate (value) {
  return value != null && typeof value === 'object' && value[Symbol.toStringTag] === 'Temporal.PlainDate'
}

function isPlainDateTime (value) {
  return value != null && typeof value === 'object' && value[Symbol.toStringTag] === 'Temporal.PlainDateTime'
}

function isPlainTime (value) {
  return value != null && typeof value === 'object' && value[Symbol.toStringTag] === 'Temporal.PlainTime'
}

class UnexpectedValueError extends Error {
  constructor(value) {
    super(`Unexpected value encountered: ${String(value)}`);
    this.name = 'UnexpectedValueError';
  }
}

class Writer {
  constructor () {
    this.buffer = ''
  }

  writeArray (array) {
    this.buffer += '('

    for (let i = 0; i < array.length; i++) {
      if (i > 0) {
        this.buffer += ','
      }

      this.writeValue(array[i])
    }

    if (array.length === 1) {
      // An array of length one needs a trailing comma
      this.buffer += ','
    }

    this.buffer += ')'
  }

  writeObject (object) {
    this.buffer += '('

    let skipComma = true
    const keys = Object.keys(object)

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const value = object[key]

      if (value === undefined) {
        continue
      }

      if (skipComma) {
        skipComma = false
      } else {
        this.buffer += ','
      }

      this.buffer += JSON.stringify(key) + ':'
      this.writeValue(value)
    }

    if (keys.length === 0) {
      // The special (:) syntax creates an empty dictionary
      this.buffer += ':'
    }

    this.buffer += ')'
  }

  writeValue (value) {
    if (value === undefined) {
      throw new UnexpectedValueError(value)
    }

    if (value == null) {
      this.buffer += 'none'
      return
    }

    switch (typeof value) {
      case 'boolean':
      case 'string':
        this.buffer += JSON.stringify(value)
        return

      case 'number':
        if (Number.isNaN(value)) {
          this.buffer += 'float.nan'
          return
        }

        if (value === Infinity) {
          this.buffer += 'float.inf'
          return
        }

        if (value === -Infinity) {
          this.buffer += '-float.inf'
          return
        }

        this.buffer += value.toString()
        return

      case 'bigint':
        this.buffer += value.toString()
        return

      case 'function':
      case 'symbol':
        throw new UnexpectedValueError(value)
    }

    if (Array.isArray(value)) {
      return this.writeArray(value)
    }

    if (isPlainDate(value)) {
      this.buffer += `datetime(year:${value.year},month:${value.month},day:${value.day})`
      return
    }

    if (isPlainDateTime(value)) {
      this.buffer += `datetime(year:${value.year},month:${value.month},day:${value.day},hour:${value.hour},minute:${value.minute},second:${value.second})`
      return
    }

    if (isPlainTime(value)) {
      this.buffer += `datetime(hour:${value.hour},minute:${value.minute},second:${value.second})`
      return
    }

    // These are currently not supported, but could potentially be in the future
    if (value instanceof Date || value instanceof Map || value instanceof RegExp || value instanceof Set) {
      throw new UnexpectedValueError(value)
    }

    return this.writeObject(value)
  }

  toString () {
    return this.buffer
  }
}

export default function serializeTypstValue (input) {
  const writer = new Writer()

  writer.writeValue(input)

  return writer.toString()
}
