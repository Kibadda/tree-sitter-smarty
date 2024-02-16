[
  "{"
  "{/"
  "}"
] @tag.delimiter

[
  "="
  ":"
  "|"
] @operator

(modifierfunction) @function.call

[
  (tag)
  (start_tag)
  (end_tag)
] @tag

(key) @tag.attribute

(comment) @comment
