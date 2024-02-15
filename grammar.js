module.exports = grammar({
  name: 'smarty',

  externals: $ => [
    $.inline,
    $.comment,
    $.text,
    $.attribute_key,
    $.attribute_value,

    $.error_check, // just for error correction
  ],

  extras: $ => [
    $.comment,
    /\s/,
  ],

  rules: {
    template: $ => repeat($._smarty),

    _smarty: $ => choice(
      // html
      $.text,

      // variables https://smarty-php.github.io/smarty/4.x/designers/language-variables/
      $.inline,

      // builtin functions https://smarty-php.github.io/smarty/4.x/designers/language-builtin-functions/
      $.append,
      $.assign,
      $.block,
      $.call,
      $.capture,
      $.config_load,
      $.debug,
      $.extends,
      $.for,
      $.foreach,
      $.function,
      $.if,
      $.include,
      $.insert,
      $.ldelim,
      $.rdelim,
      // $.literal,
      $.nocache,
      $.section,
      $.setfilter,
      $.strip,
      $.while,

      // custom functions https://smarty-php.github.io/smarty/4.x/designers/language-custom-functions/
      $.counter,
      $.cycle,
      $.eval,
      $.fetch,
      $.html_checkboxes,
      $.html_image,
      $.html_options,
      $.html_radios,
      $.html_select_date,
      $.html_select_time,
      $.html_table,
      $.mailto,
      $.math,
      $.textformat,
    ),

    append: $ => tag($, 'append', true, false),
    assign: $ => tag($, 'assign', true, false),
    block: $ => tag($, 'block', true, true),
    call: $ => tag($, 'call', true, false),
    capture: $ => tag($, 'capture', true, true),
    config_load: $ => tag($, 'config_load', true, false),
    debug: $ => tag($, 'debug', false, false),
    extends: $ => tag($, 'extends', true, false),
    for: $ => seq(
      '{',
      alias('for', $.start_tag),
      field('expression', alias($.forexpression, $.expression)),
      '}',
      field('body', alias(repeat($._smarty), $.body)),
      field('alternative', optional($.forelse)),
      '{/',
      alias('for', $.end_tag),
      '}',
    ),
    foreach: $ => seq(
      '{',
      alias('foreach', $.start_tag),
      field('expression', alias($.foreachexpression, $.expression)),
      '}',
      field('body', alias(repeat($._smarty), $.body)),
      field('alternative', optional($.foreachelse)),
      '{/',
      alias('foreach', $.end_tag),
      '}',
    ),
    function: $ => tag($, 'function', true, true),
    if: $ => seq(
      '{',
      alias('if', $.start_tag),
      field('condition', $.condition),
      '}',
      field('body', alias(repeat($._smarty), $.body)),
      repeat(field('alternative', $.elseif)),
      optional(field('alternative', $.else)),
      '{/',
      alias('if', $.end_tag),
      '}',
    ),
    include: $ => tag($, 'include', true, false),
    insert: $ => tag($, 'insert', true, false),
    ldelim: $ => tag($, 'ldelim', false, false),
    rdelim: $ => tag($, 'rdelim', false, false),
    // literal
    nocache: $ => tag($, 'nocache', false, true),
    section: $ => tag($, 'section', true, true),
    setfilter: $ => tag($, 'setfilter', true, true),
    strip: $ => tag($, 'strip', false, true),
    while: $ => seq(
      '{',
      alias('while', $.start_tag),
      field('condition', $.condition),
      '}',
      field('body', alias(repeat($._smarty), $.body)),
      '{/',
      alias('while', $.end_tag),
      '}',
    ),

    counter: $ => tag($, 'counter', true, false),
    cycle: $ => tag($, 'cycle', true, false),
    eval: $ => tag($, 'eval', true, false),
    fetch: $ => tag($, 'fetch', true, false),
    html_checkboxes: $ => tag($, 'html_checkboxes', true, false),
    html_image: $ => tag($, 'html_image', true, false),
    html_options: $ => tag($, 'html_options', true, false),
    html_radios: $ => tag($, 'html_radios', true, false),
    html_select_date: $ => tag($, 'html_select_date', true, false),
    html_select_time: $ => tag($, 'html_select_time', true, false),
    html_table: $ => tag($, 'html_table', true, false),
    mailto: $ => tag($, 'mailto', true, false),
    math: $ => tag($, 'math', true, false),
    textformat: $ => tag($, 'textformat', true, true),

    attributelist: $ => repeat1($.attribute),

    attribute: $ => choice(
      alias($.attribute_value, $.value),
      seq(alias($.attribute_key, $.key), '=', alias($.attribute_value, $.value)),
    ),

    foreachexpression: _ => seq(
      /\$[^\s]+/,
      'as',
      /\$[^\s=}]+/,
      optional(seq(
        '=>',
        /\$[^}]+/,
      )),
    ),

    foreachelse: $ => seq(
      '{',
      alias('foreachelse', $.tag),
      '}',
      field('body', alias(repeat($._smarty), $.body)),
    ),

    forexpression: _ => seq(
      /\$[^\s=]+/,
      '=',
      /[^\s]+/,
      'to',
      /[^\s}]+/,
      optional(seq(
        'step',
        /[^}]+/,
      )),
    ),

    forelse: $ => seq(
      '{',
      alias('forelse', $.tag),
      '}',
      field('body', alias(repeat($._smarty), $.body)),
    ),

    condition: _ => /[^}]+/,

    elseif: $ => prec.left(1, seq(
      '{',
      alias('elseif', $.tag),
      field('condition', $.condition),
      '}',
      field('body', alias(repeat($._smarty), $.body)),
    )),

    else: $ => seq(
      '{',
      alias('else', $.tag),
      '}',
      field('body', alias(repeat($._smarty), $.body)),
    ),
  },
});

function tag($, name, attributes = true, body = true) {
  let arguments = ['{', alias(name, body ? $.start_tag : $.tag)];

  if (attributes) {
    arguments.push(optional(field('attributes', $.attributelist)));
  }

  arguments.push('}');

  if (body) {
    arguments.push(field('body', alias(repeat($._smarty), $.body)));
    arguments.push('{/');
    arguments.push(alias(name, $.end_tag));
    arguments.push('}');
  }

  return seq(...arguments);
}
