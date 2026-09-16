sed -i 's/onClick={fetchServers}/onClick={() => window.location.reload()}/g' src/components/SshServerList.tsx
