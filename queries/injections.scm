((text) @injection.content
  (#set! injection.combined)
  (#set! injection.language "html"))

((value) @injection.content
  (#set! injection.language "php_only"))

((condition) @injection.content
  (#set! injection.language "php_only"))

((expression) @injection.content
  (#set! injection.language "php_only"))

((inline) @injection.content
  (#offset! injection.content 0 1 0 -1)
  (#set! injection.language "php_only"))
