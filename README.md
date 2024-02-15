# tree-sitter-smarty

This now supports most of the smarty functionality. There are still things missing (e.g. like modifiers for functions and literal).

## Usage
First add parser:

```lua
local parsers = require("nvim-treesitter.parsers").get_parser_configs()

parsers.smarty = {
  install_info = {
    url = "https://github.com/Kibadda/tree-sitter-smarty",
    files = { "src/parser.c", "src/scanner.c" },
    branch = "dev",
  },
}
```

Then follow [adding queries](https://github.com/nvim-treesitter/nvim-treesitter#adding-queries).
