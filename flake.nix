{
  description =
    "Lumina Theme Generator Development Environment (Node.js 22 LTS)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = nixpkgs.legacyPackages.${system};
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [ nodejs_22 ];

          shellHook = ''
            echo "Welcome to the Lumina Theme Generator development environment!"
            echo "Available tools: Node.js $(node --version), npm $(npm --version)"
            echo ""
            echo "To get started:"
            echo "  npm install    # Install dependencies"
            echo "  npm run dev    # Start development server"
            echo "  npm run build  # Build for production"
          '';
        };
      });
}
