#include <stdio.h>
#include <string.h>
#include <tree_sitter/parser.h>
#include <wctype.h>

#define MAX_TAG_SIZE 200

enum TokeyType {
  INLINE,
  COMMENT,
  TEXT,
  ATTRIBUTE_KEY,
  ATTRIBUTE_VALUE,

  ERROR_CHECK,
};

static inline void consume(TSLexer *lexer) { lexer->advance(lexer, false); }
static inline void skip(TSLexer *lexer) { lexer->advance(lexer, true); }

static inline bool consume_char(char c, TSLexer *lexer) {
  if (lexer->lookahead != c) {
    return false;
  }

  consume(lexer);

  return true;
}

static inline void skip_whitespace(TSLexer *lexer) {
  while (iswspace(lexer->lookahead)) {
    skip(lexer);
  }
}

void *tree_sitter_smarty_external_scanner_create() { return NULL; }

void tree_sitter_smarty_external_scanner_destroy(void *payload) {}

unsigned tree_sitter_smarty_external_scanner_serialize(void *payload,
                                                       char *buffer) {
  return 0;
}

void tree_sitter_smarty_external_scanner_deserialize(void *payload,
                                                     const char *buffer,
                                                     unsigned length) {}

#define KEYWORD_LENGTH 51
const char *keywords[KEYWORD_LENGTH] = {
    // builtin functions
    "append",

    "assign",

    "block",
    "/block",

    "call",

    "capture",
    "/capture",

    "config_load",

    "debug",

    "extends",

    "for",
    "forelse",
    "/for",

    "foreach",
    "foreachelse",
    "/foreach",

    "function",
    "/function",

    "if",
    "elseif",
    "else",
    "/if",

    "include",

    "insert",

    "ldelim",

    "rdelim",

    // "literal",     "/literal",

    "nocache",
    "/nocache",

    "section",
    "/section",

    "setfilter",
    "/setfilter",

    "strip",
    "/strip",

    "while",
    "/while",

    // custom functions
    "counter",

    "cycle",

    "eval",

    "fetch",

    "html_checkboxes",

    "html_image",

    "html_options",

    "html_radios",

    "html_select_date",

    "html_select_time",

    "html_table",

    "mailto",

    "math",

    "textformat",
    "/textformat",
};

static bool scan_inline(TSLexer *lexer) {
  char tag[MAX_TAG_SIZE] = "";
  unsigned size = 0;

  while (!iswspace(lexer->lookahead) && lexer->lookahead != '}') {
    if (size == MAX_TAG_SIZE) {
      return false;
    }

    tag[size++] = lexer->lookahead;
    consume(lexer);
  }

  if (size == 0) {
    return false;
  }

  for (size_t i = 0; i < KEYWORD_LENGTH; i++) {
    if (strcmp(tag, keywords[i]) == 0) {
      return false;
    }
  }

  while (lexer->lookahead != '}') {
    consume(lexer);
  }

  consume(lexer);

  return true;
}

static bool scan_text(TSLexer *lexer) {
  bool has_consumed = false;

  for (;;) {
    if (lexer->eof(lexer)) {
      lexer->mark_end(lexer);
      return has_consumed;
    }

    if (lexer->lookahead == '{') {
      lexer->mark_end(lexer);

      consume(lexer);

      if (!iswspace(lexer->lookahead) && lexer->lookahead != '}') {
        return has_consumed;
      }
    } else {
      consume(lexer);

      has_consumed = true;
    }
  }
}

static bool scan_comment(TSLexer *lexer) {
  if (!consume_char('*', lexer)) {
    return false;
  }

  bool last_char_was_star = false;

  for (;;) {
    if (lexer->eof(lexer)) {
      return false;
    }

    if (lexer->lookahead == '}' && last_char_was_star) {
      consume(lexer);

      return true;
    }

    last_char_was_star = lexer->lookahead == '*';

    consume(lexer);
  }
}

static bool scan_attribute(TSLexer *lexer, bool key_valid) {
  if (lexer->lookahead == '}') {
    return false;
  }

  if (consume_char('\'', lexer)) {
    while (!lexer->eof(lexer)) {
      if (consume_char('\'', lexer)) {
        lexer->result_symbol = ATTRIBUTE_VALUE;
        return true;
      }

      consume(lexer);
    }
  } else if (consume_char('"', lexer)) {
    while (!lexer->eof(lexer)) {
      if (consume_char('"', lexer)) {
        lexer->result_symbol = ATTRIBUTE_VALUE;
        return true;
      }

      consume(lexer);
    }
  } else if (consume_char('[', lexer)) {
    while (!lexer->eof(lexer)) {
      if (consume_char(']', lexer)) {
        lexer->result_symbol = ATTRIBUTE_VALUE;
        return true;
      }

      consume(lexer);
    }
  } else if (!key_valid) {
    while (!lexer->eof(lexer)) {
      if (iswspace(lexer->lookahead) || lexer->lookahead == '}') {
        lexer->result_symbol = ATTRIBUTE_VALUE;
        return true;
      }

      consume(lexer);
    }
  } else {
    bool has_skipped_whitespace = false;

    while (!lexer->eof(lexer)) {
      if (iswspace(lexer->lookahead)) {
        lexer->mark_end(lexer);
        skip_whitespace(lexer);
        has_skipped_whitespace = true;
      }

      if (lexer->lookahead == '=') {
        lexer->result_symbol = ATTRIBUTE_KEY;
        return true;
      } else if ((has_skipped_whitespace && !iswspace(lexer->lookahead)) ||
                 lexer->lookahead == '}') {
        lexer->result_symbol = ATTRIBUTE_VALUE;
        return true;
      }

      consume(lexer);
    }
  }

  return false;
}

bool tree_sitter_smarty_external_scanner_scan(void *payload, TSLexer *lexer,
                                              const bool *valid_symbols) {
  if (valid_symbols[ERROR_CHECK]) {
    return false;
  }

  skip_whitespace(lexer);

  if (valid_symbols[ATTRIBUTE_KEY] || valid_symbols[ATTRIBUTE_VALUE]) {
    return scan_attribute(lexer, valid_symbols[ATTRIBUTE_KEY]);
  } else {
    if (lexer->lookahead == '{') {
      consume(lexer);

      if (lexer->lookahead == '*') {
        if (valid_symbols[COMMENT] && scan_comment(lexer)) {
          lexer->result_symbol = COMMENT;
          return true;
        }
      } else if (iswspace(lexer->lookahead) || lexer->lookahead == '}') {
        if (valid_symbols[TEXT] && scan_text(lexer)) {
          lexer->result_symbol = TEXT;
          return true;
        }
      } else {
        if (valid_symbols[INLINE] && scan_inline(lexer)) {
          lexer->result_symbol = INLINE;
          return true;
        }
      }
    } else {
      if (valid_symbols[TEXT] && scan_text(lexer)) {
        lexer->result_symbol = TEXT;
        return true;
      }
    }
  }

  return false;
}
