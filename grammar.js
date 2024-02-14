module.exports = grammar({
  name: 'smarty',

  externals: $ => [
    $.inline,
    $.comment,
    $.text,
    $.attribute_key,
    $.attribute_value,
    $.error_check,
  ],

  extras: $ => [
    $.comment,
    /\s/,
  ],

  rules: {
    template: $ => repeat($._smarty),

    _smarty: $ => choice(
      $.inline,
      $.text,

      $.append,
      $.assign,
      $.block,
      $.call,
      // $.capture,
      $.config_load,
      $.debug,
      $.extends,
      // $.for,
      $.foreach,
      $.function,
      $.if,
      $.include,
      $.insert,
      $.ldelim,
      $.rdelim,
      // $.literal,
      $.nocache,
      // $.section,
      $.setfilter,
      $.strip,
      // $.while,
    ),

    append: $ => tag($, 'append', true, false),
    assign: $ => tag($, 'assign', true, false),
    block: $ => tag($, 'block', true, true),
    call: $ => tag($, 'call', true, false),
    // capture
    config_load: $ => tag($, 'config_load', true, false),
    debug: $ => tag($, 'debug', false, false),
    extends: $ => tag($, 'extends', true, false),
    // for
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
      field('condition', alias($.ifcondition, $.condition)),
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
    // section
    setfilter: $ => tag($, 'setfilter', true, true),
    strip: $ => tag($, 'strip', false, true),
    // while

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

    ifcondition: _ => /[^}]+/,

    elseif: $ => prec.left(1, seq(
      '{',
      alias('elseif', $.tag),
      field('condition', alias($.ifcondition, $.condition)),
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
