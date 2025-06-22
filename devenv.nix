{ pkgs, ... }:

{
  packages =
    [ pkgs.git pkgs.nodejs_22 pkgs.nodePackages.npm pkgs.nodePackages.pnpm ];

  scripts.hello.exec = "echo hello from devenv";
  scripts.dev.exec = "npm run dev";
  scripts.build.exec = "npm run build";
  scripts.lint.exec = "npm run lint";

  enterShell = ''
    echo
    echo 🎨 Welcome to Lumina Theme Generator!
    echo
    echo Available commands:
    echo "  dev   - Start development server"
    echo "  build - Build for production"
    echo "  lint  - Run ESLint"
    echo
    echo Run 'npm install' first if this is a fresh clone.
    echo
  '';

  processes.dev.exec = "npm run dev";

  languages.javascript = {
    enable = true;
    npm.enable = true;
  };
}
