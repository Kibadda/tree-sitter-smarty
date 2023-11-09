# tree-sitter-smarty

## Usage
First add parser:

```lua
local parsers = require("nvim-treesitter.parsers").get_parser_configs()

parsers.smarty = {
  install_info = {
    url = "https://github.com/Kibadda/tree-sitter-smarty",
    files = { "src/parser.c" },
    branch = "main",
  },
}
```

Then follow [adding queries](https://github.com/nvim-treesitter/nvim-treesitter#adding-queries).
