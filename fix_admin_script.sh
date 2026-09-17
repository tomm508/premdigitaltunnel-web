cat src/components/AdminPanel.tsx | tr '\n' '\f' | sed 's|echo "VPS Script Berhasil Dipasang!"\\`;|echo "VPS Script Berhasil Dipasang!"`;|g' | tr '\f' '\n' > temp.tsx
mv temp.tsx src/components/AdminPanel.tsx
