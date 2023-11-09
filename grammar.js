module.exports = grammar({
  name: 'smarty',

  extras: $ => [
    $.comment,
    /\s+/,
  ],

  rules: {
    template: $ => repeat($._smarty),

    _smarty: $ => choice(
      $.inline,
      $.include,
      $.block,
      $.text,
      $.foreach,
      $.if,
      $.nocache,
      // $.literal,
    ),

    _nested: $ => choice(
      $.inline,
      $.include,
      $.text,
      $.foreach,
      $.if,
      $.nocache,
    ),

    comment: $ => seq('{*', optional(repeat($.text)), '*}'),

    inline: $ => seq(
      '{',
      alias($.text, $.php),
      repeat(seq(
        '|',
        $.modifier,
      )),
      '}'
    ),

    include: $ => seq(
      '{include',
      repeat($.parameter),
      '}',
    ),

    block: $ => seq(
      '{block',
      repeat($.parameter),
      '}',
      alias(repeat($._nested), $.body),
      '{/block}',
    ),

    foreach: $ => seq(
      '{foreach',
      /\$[^\s]+/,
      'as',
      /\$[^\s=}]+/,
      optional(seq(
        '=>',
        /\$[^}]+/,
      )),
      '}',
      field('body', alias(repeat($._nested), $.body)),
      field('alternative', optional($.foreach_else)),
      '{/foreach}',
    ),

    foreach_else: $ => seq(
      '{foreachelse}',
      alias(repeat($._nested), $.body),
    ),

    if: $ => seq(
      '{if',
      field('condition', alias(/[^}]+/, $.text)),
      '}',
      field('body', alias(repeat($._nested), $.body)),
      repeat(field('alternative', $.else_if)),
      optional(field('alternative', $.else)),
      '{/if}',
    ),

    else_if: $ => seq(
      '{elseif',
      field('condition', alias(/[^}]+/, $.text)),
      '}',
      field('body', alias(repeat($._nested), $.body)),
    ),

    else: $ => seq(
      '{else}',
      field('body', alias(repeat($._nested), $.body)),
    ),

    nocache: $ => seq(
      '{nocache}',
      field('body', alias(repeat($._nested), $.body)),
      '{/nocache}',
    ),

    // literal: $ => seq(
    //   '{literal}',
    //   field('body', alias(repeat($._smarty), $.text)),
    //   '{/literal}',
    // ),

    modifier: $ => seq(
      /[^|:}]+/,
      repeat(seq(
        ':',
        alias(/[^|:}]+/, $.parameter),
      )),
    ),

    parameter: $ => /[^\s=]+[\s]*=[\s]*('[^']*'|"[^"]*"|\[[^]]*])/,

    text: $ => prec(-1, /[^\s\|{*}-]([^\|{*}]*[^\|{*}-])?/),
  },
});
