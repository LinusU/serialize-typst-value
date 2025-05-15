import assert from 'node:assert/strict'
import test from 'node:test'

import { Temporal } from '@js-temporal/polyfill'

import serializeTypstValue from './index.js'

test('primitives', () => {
  assert.equal(serializeTypstValue(null), 'none')
  assert.equal(serializeTypstValue(true), 'true')
  assert.equal(serializeTypstValue(false), 'false')
  assert.equal(serializeTypstValue(0), '0')
  assert.equal(serializeTypstValue(1), '1')
  assert.equal(serializeTypstValue(-1), '-1')
  assert.equal(serializeTypstValue(1.5), '1.5')
  assert.equal(serializeTypstValue(NaN), 'float.nan')
  assert.equal(serializeTypstValue(Infinity), 'float.inf')
  assert.equal(serializeTypstValue(-Infinity), '-float.inf')
  assert.equal(serializeTypstValue(''), '""')
  assert.equal(serializeTypstValue('foo'), '"foo"')
  assert.equal(serializeTypstValue('foo bar'), '"foo bar"')
  assert.equal(serializeTypstValue('foo\nbar'), '"foo\\nbar"')
  assert.equal(serializeTypstValue('foo"bar'), '"foo\\"bar"')
  assert.equal(serializeTypstValue('foo\\bar'), '"foo\\\\bar"')
  assert.equal(serializeTypstValue('foo\\\nbar'), '"foo\\\\\\nbar"')
  assert.equal(serializeTypstValue('foo\\\r\nbar'), '"foo\\\\\\r\\nbar"')
  assert.equal(serializeTypstValue('foo\\\rbar'), '"foo\\\\\\rbar"')
  assert.equal(serializeTypstValue('foo\\\nbar'), '"foo\\\\\\nbar"')
  assert.equal(serializeTypstValue('foo\\\r\nbar'), '"foo\\\\\\r\\nbar"')
  assert.equal(serializeTypstValue(45_123_456_789n), '45123456789')
})

test('arrays', () => {
  assert.equal(serializeTypstValue([]), '()')
  assert.equal(serializeTypstValue([1]), '(1,)')
  assert.equal(serializeTypstValue([1, 2]), '(1,2)')
  assert.equal(serializeTypstValue([1, 2, 3]), '(1,2,3)')
  assert.equal(serializeTypstValue([true, "foo", null]), '(true,"foo",none)')
  assert.equal(serializeTypstValue([null, null, 100n]), '(none,none,100)')
})

test('objects', () => {
  assert.equal(serializeTypstValue({}), '(:)')
  assert.equal(serializeTypstValue({ "": 1 }), '("":1)')
  assert.equal(serializeTypstValue({ foo: 1 }), '("foo":1)')
  assert.equal(serializeTypstValue({ foo: 1, bar: 2 }), '("foo":1,"bar":2)')
  assert.equal(serializeTypstValue({ foo: 1, bar: 2, baz: 3 }), '("foo":1,"bar":2,"baz":3)')
  assert.equal(serializeTypstValue({ foo: true, bar: "foo", baz: null }), '("foo":true,"bar":"foo","baz":none)')
  assert.equal(serializeTypstValue({ foo: null, bar: null, baz: 100n }), '("foo":none,"bar":none,"baz":100)')
  assert.equal(serializeTypstValue({ foo: undefined, bar: 100n }), '("bar":100)')
})

test('Temporal', () => {
  assert.equal(serializeTypstValue(Temporal.PlainDate.from('2023-10-01')), 'datetime(year:2023,month:10,day:1)')
  assert.equal(serializeTypstValue(Temporal.PlainDateTime.from('2023-10-01T12:34:56')), 'datetime(year:2023,month:10,day:1,hour:12,minute:34,second:56)')
  assert.equal(serializeTypstValue(Temporal.PlainTime.from('12:34:56')), 'datetime(hour:12,minute:34,second:56)')
})

test('errors', () => {
  assert.throws(() => serializeTypstValue(undefined), { name: 'UnexpectedValueError' })
  assert.throws(() => serializeTypstValue(Symbol('foo')), { name: 'UnexpectedValueError' })
  assert.throws(() => serializeTypstValue(() => {}), { name: 'UnexpectedValueError' })
})

test('example: kitchen slip', () => {
  const input = {
    createdAt: Temporal.PlainDateTime.from('2025-05-15T10:21:25.648'),
    deliveryAddress: null,
    deliveryTime: null,
    estimatedDeliveryTime: Temporal.PlainDateTime.from('2025-05-15T10:51:25.655'),
    isCopy: false,
    lineItemSections: [
      {
        isSecondary: false,
        title: '',
        items: [
          {
            count: 1,
            name: 'Al tonno',
            alternativeItems: null,
            message: 'Utan tonfisk tack!'
          },
          {
            count: 1,
            name: 'Capricciosa',
            alternativeItems: null,
            message: null
          },
          {
            count: 13,
            name: 'Kebabpizza',
            alternativeItems: null,
            message: null
          },
          {
            count: 3,
            name: 'Vesuvio',
            alternativeItems: [
              { prefix: '−', name: 'Vanlig' },
              { prefix: '•', name: 'Glutenfri' }
            ],
            message: null
          },
          {
            count: 1,
            name: 'Calzone (inbakad)',
            alternativeItems: [ { prefix: '3', name: 'Skinka' } ],
            message: 'Mycket skinka!! 😁'
          }
        ]
      }
    ],
    message: null,
    now: Temporal.PlainDateTime.from('2025-05-15T10:21:26.344'),
    orderNumber: '308',
    orderType: 'TakeAway',
    phoneNumber: '070-123 45 67',
    printerName: 'Varmkök',
    riderPickupTime: null,
    tableName: 'Avhämtning',
    tipPercentage: 10,
    transactionChannel: 'Web'
  }

  const expected = `
    (
      "createdAt": datetime(year: 2025, month: 5, day: 15, hour: 10, minute: 21, second: 25),
      "deliveryAddress": none,
      "deliveryTime": none,
      "estimatedDeliveryTime": datetime(year: 2025, month: 5, day: 15, hour: 10, minute: 51, second: 25),
      "isCopy": false,
      "lineItemSections": (
        (
          "isSecondary": false,
          "title": "",
          "items": (
            (
              "count": 1,
              "name": "Al tonno",
              "alternativeItems": none,
              "message": "Utan tonfisk tack!"
            ),
            (
              "count": 1,
              "name": "Capricciosa",
              "alternativeItems": none,
              "message": none
            ),
            (
              "count": 13,
              "name": "Kebabpizza",
              "alternativeItems": none,
              "message": none
            ),
            (
              "count": 3,
              "name": "Vesuvio",
              "alternativeItems": (
                ("prefix": "−", "name": "Vanlig"),
                ("prefix": "•", "name": "Glutenfri")
              ),
              "message": none
            ),
            (
              "count": 1,
              "name": "Calzone (inbakad)",
              "alternativeItems": (("prefix": "3", "name": "Skinka" ),),
              "message": "Mycket skinka!! 😁"
            )
          )
        ),
      ),
      "message": none,
      "now": datetime(year: 2025, month: 5, day: 15, hour: 10, minute: 21, second: 26),
      "orderNumber": "308",
      "orderType": "TakeAway",
      "phoneNumber": "070-123 45 67",
      "printerName": "Varmkök",
      "riderPickupTime": none,
      "tableName": "Avhämtning",
      "tipPercentage": 10,
      "transactionChannel": "Web"
    )
  `

  assert.equal(serializeTypstValue(input).replaceAll(/\s/g, ''), expected.replaceAll(/\s/g, ''))
})
