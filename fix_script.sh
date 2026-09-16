sed -i '205,394c\
  const vpsInstallerScript = `# 1. Buat konfigurasi Node:\n\
cat > /root/node_config.txt << '"'EOF'"'\n\
NODE_ID="${selectedNodeId}"\n\
NODE_NAME="${customNodeName}"\n\
CITY="${customNodeCity}"\n\
COUNTRY_CODE="${customNodeCountryCode}"\n\
PROJECT_ID="${firebaseConfig.projectId}"\n\
API_KEY="${firebaseConfig.apiKey}"\n\
EOF\n\
\n\
# 2. Install Worker Auto-Create & Reporter sekaligus:\n\
bash <(curl -s https://raw.githubusercontent.com/tomm508/premdigitaltunnel-v2/main/vps-scripts/install_worker.sh)`;\n\
\n\
  const copyToClipboard = () => {\n\
    navigator.clipboard.writeText(vpsInstallerScript);\n\
    setCopiedScript(true);\n\
    setTimeout(() => setCopiedScript(false), 3000);\n\
  };' src/components/AdminPanel.tsx
