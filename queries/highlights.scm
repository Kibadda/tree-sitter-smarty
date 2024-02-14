[
  "{"
  "{/"
  "}"
] @tag.delimiter

"=" @operator

[
  (tag)
  (start_tag)
  (end_tag)
] @tag

(key) @tag.attribute

(comment) @comment
