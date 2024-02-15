((text) @injection.content
  (#set! injection.combined)
  (#set! injection.language "html"))

((value) @injection.content
  (#set! injection.language "php_only"))

((condition) @injection.content
  (#set! injection.language "php_only"))

((expression) @injection.content
  (#set! injection.language "php_only"))

((php) @injection.content
  (#set! injection.language "php_only"))

((parameter) @injection.content
  (#set! injection.language "php_only"))
