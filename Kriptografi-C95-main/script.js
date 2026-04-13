const BLOCK_SIZE = 8;
const key = "12345678";

const { createApp, nextTick } = Vue;
const { createVuetify } = Vuetify;

const DEFAULT_THEME = {
  dark: {
    primary: '#6366f1',
    success: '#22c55e',
    error: '#ef4444',
    purple: '#a855f7',
    secondary: '#334155',
    warning: '#f59e0b',
    surface: '#0f172a',
    background: '#020617'
  },
  light: {
    primary: '#4f46e5',
    success: '#16a34a',
    error: '#dc2626',
    purple: '#9333ea',
    secondary: '#94a3b8',
    warning: '#d97706',
    surface: '#ffffff',
    background: '#e2e8f0'
  }
};

const PRESETS = {
  hacker: {
    primary: '#00ff9f',
    success: '#00e676',
    error: '#ff5252',
    purple: '#7c3aed',
    secondary: '#1f2937',
    warning: '#ffd600',
    surface: '#121a17',
    background: '#0a0f0d'
  },
  ocean: {
    primary: '#3b82f6',
    success: '#22c55e',
    error: '#ef4444',
    purple: '#8b5cf6',
    secondary: '#475569',
    warning: '#f59e0b',
    surface: '#1e293b',
    background: '#0f172a'
  },
  neon: {
    primary: '#ff00ff',
    success: '#00ffcc',
    error: '#ff4d6d',
    purple: '#a855f7',
    secondary: '#3f3f46',
    warning: '#ffd166',
    surface: '#1a001a',
    background: '#0a0a0a'
  }
};

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: { ...DEFAULT_THEME.dark }
      },
      light: {
        dark: false,
        colors: { ...DEFAULT_THEME.light }
      }
    }
  }
});

createApp({
  data() {
    return {
      isDark: true,
      inputText: '',
      outputText: '',
      blocks: [],
      highlightedBlockIndex: -1,
      selectedFile: null,
      selectedFileName: '',
      isDragging: false,
      snackbar: {
        show: false,
        text: ''
      },

      themeColors: { ...DEFAULT_THEME.dark },
      colorFields: [
        { key: 'primary', label: 'Primary' },
        { key: 'success', label: 'Success' },
        { key: 'error', label: 'Error' },
        { key: 'purple', label: 'Purple' },
        { key: 'secondary', label: 'Secondary' },
        { key: 'warning', label: 'Warning' },
        { key: 'surface', label: 'Surface' },
        { key: 'background', label: 'Background' }
      ]
    };
  },

  

  mounted() {
    this.updateThemeColors();
    this.drawDiagram([]);
  },

  methods: {
    toggleMode() {
      this.isDark = !this.isDark;
      this.$vuetify.theme.global.name.value = this.isDark ? 'dark' : 'light';
      this.themeColors = { ...(this.isDark ? DEFAULT_THEME.dark : DEFAULT_THEME.light) };
      this.updateThemeColors();
    },

    notify(text) {
      this.snackbar.text = text;
      this.snackbar.show = true;
    },

    updateThemeColors() {
  const themeName = this.isDark ? 'dark' : 'light';
  const theme = this.$vuetify.theme.themes.value[themeName];

  Object.keys(this.themeColors).forEach((key) => {
    theme.colors[key] = this.themeColors[key];
  });

  document.documentElement.style.setProperty('--app-primary', this.themeColors.primary);
  document.documentElement.style.setProperty('--app-secondary', this.themeColors.secondary);
  document.documentElement.style.setProperty('--app-success', this.themeColors.success);
  document.documentElement.style.setProperty('--app-error', this.themeColors.error);
  document.documentElement.style.setProperty('--app-warning', this.themeColors.warning);
  document.documentElement.style.setProperty('--app-bg', this.themeColors.background);
  document.documentElement.style.setProperty('--app-surface', this.themeColors.surface);
},

    applyPreset(name) {
      if (!PRESETS[name]) return;
      this.themeColors = { ...PRESETS[name] };
      this.updateThemeColors();
      this.notify(`Preset ${name} diterapkan.`);
    },

    resetTheme() {
      this.themeColors = { ...(this.isDark ? DEFAULT_THEME.dark : DEFAULT_THEME.light) };
      this.updateThemeColors();
      this.notify('Tema berhasil direset.');
    },

    xorBlock(a, b) {
      let result = [];
      for (let i = 0; i < BLOCK_SIZE; i++) {
        result[i] = a.charCodeAt(i) ^ b.charCodeAt(i);
      }
      return String.fromCharCode(...result);
    },

    substitute(block) {
      return block.split("").map(c => String.fromCharCode(c.charCodeAt(0) + 3)).join("");
    },

    inverseSubstitute(block) {
      return block.split("").map(c => String.fromCharCode(c.charCodeAt(0) - 3)).join("");
    },

    toHex(str) {
      return Array.from(str)
        .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('');
    },

    fromHex(hex) {
      let result = '';
      for (let i = 0; i < hex.length; i += 2) {
        result += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      }
      return result;
    },

    showBlocks(text) {
      this.blocks = [];
      for (let i = 0; i < text.length; i += BLOCK_SIZE) {
        this.blocks.push(text.substring(i, i + BLOCK_SIZE));
      }
    },

    drawDiagram(blocks) {
      const canvas = this.$refs.diagramCanvas;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = canvas.clientWidth || 700;
      const displayHeight = 220;

      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      const blockWidth = 72;
      const blockHeight = 42;
      const gap = 26;
      const startY = 88;
      let x = 20;

      ctx.font = '14px Roboto';
      ctx.lineWidth = 2;
      ctx.strokeStyle = this.isDark ? '#cbd5e1' : '#334155';

      blocks.forEach((_, i) => {
        ctx.fillStyle = this.themeColors.primary;
        ctx.beginPath();
        ctx.roundRect(x, startY, blockWidth, blockHeight, 12);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(`B${i + 1}`, x + 24, startY + 25);

        if (i > 0) {
          ctx.beginPath();
          ctx.moveTo(x - gap + 8, startY + blockHeight / 2);
          ctx.lineTo(x - 6, startY + blockHeight / 2);
          ctx.stroke();
        }

        x += blockWidth + gap;
      });
    },

    async animateCBC() {
      if (this.blocks.length === 0) {
        this.notify('Belum ada blok untuk dianimasikan.');
        return;
      }

      for (let i = 0; i < this.blocks.length; i++) {
        this.highlightedBlockIndex = i;
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      this.highlightedBlockIndex = -1;
    },

    encrypt() {
      const text = this.inputText;
      let prev = key;
      let result = '';

      for (let i = 0; i < text.length; i += BLOCK_SIZE) {
        const block = text.substring(i, i + BLOCK_SIZE).padEnd(8, "\0");
        const xored = this.xorBlock(block, prev);
        const encrypted = this.substitute(xored);
        prev = encrypted;
        result += encrypted;
      }

      const hexResult = this.toHex(result);
      this.outputText = hexResult;
      this.showBlocks(hexResult);
      this.drawDiagram(this.blocks);
    },

    decrypt() {
      const hexInput = this.inputText.trim();
      if (!hexInput) {
        this.outputText = '';
        this.blocks = [];
        this.drawDiagram([]);
        return;
      }

      const cipher = this.fromHex(hexInput);
      let prev = key;
      let result = '';

      for (let i = 0; i < cipher.length; i += BLOCK_SIZE) {
        const block = cipher.substring(i, i + BLOCK_SIZE);
        const temp = block;
        const decrypted = this.inverseSubstitute(block);
        const plain = this.xorBlock(decrypted, prev);
        prev = temp;
        result += plain;
      }

      this.outputText = result.replace(/\0/g, '');
      this.showBlocks(hexInput);
      this.drawDiagram(this.blocks);
    },

    copyText() {
      if (!this.outputText) {
        this.notify('Output masih kosong.');
        return;
      }

      navigator.clipboard.writeText(this.outputText)
        .then(() => this.notify('Output berhasil disalin.'))
        .catch(() => this.notify('Gagal menyalin output.'));
    },

    downloadFile(data, filename) {
      const blob = new Blob([data], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    },

    processTextEncryption(text) {
      let prev = key;
      let result = '';

      for (let i = 0; i < text.length; i += BLOCK_SIZE) {
        const block = text.substring(i, i + BLOCK_SIZE).padEnd(8, "\0");
        const xored = this.xorBlock(block, prev);
        const encrypted = this.substitute(xored);
        prev = encrypted;
        result += encrypted;
      }

      return this.toHex(result);
    },

    processTextDecryption(hexInput) {
      const cipher = this.fromHex(hexInput);
      let prev = key;
      let result = '';

      for (let i = 0; i < cipher.length; i += BLOCK_SIZE) {
        const block = cipher.substring(i, i + BLOCK_SIZE);
        const temp = block;
        const decrypted = this.inverseSubstitute(block);
        const plain = this.xorBlock(decrypted, prev);
        prev = temp;
        result += plain;
      }

      return result.replace(/\0/g, '');
    },

    encryptFile() {
      if (!this.selectedFile) {
        this.notify('Pilih file dulu.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const hexResult = this.processTextEncryption(text);
        this.downloadFile(hexResult, 'encrypted.txt');
        this.notify('File berhasil dienkripsi.');
      };
      reader.readAsText(this.selectedFile);
    },

    decryptFile() {
      if (!this.selectedFile) {
        this.notify('Pilih file dulu.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const result = this.processTextDecryption(text);
        this.downloadFile(result, 'decrypted.txt');
        this.notify('File berhasil didekripsi.');
      };
      reader.readAsText(this.selectedFile);
    },

    openFilePicker() {
      this.$refs.fileInput.click();
    },

    setSelectedFile(file) {
      this.selectedFile = file || null;
      this.selectedFileName = file ? file.name : '';
    },

    handleFileChange(event) {
      const file = event.target.files?.[0];
      this.setSelectedFile(file);
    },

    handleDragOver() {
      this.isDragging = true;
    },

    handleDragLeave() {
      this.isDragging = false;
    },

    handleDrop(event) {
      this.isDragging = false;
      const file = event.dataTransfer.files?.[0];
      if (!file) return;

      const dt = new DataTransfer();
      dt.items.add(file);
      this.$refs.fileInput.files = dt.files;
      this.setSelectedFile(file);
    }
  },

  watch: {
    blocks: {
      handler(newBlocks) {
        nextTick(() => this.drawDiagram(newBlocks));
      },
      deep: true
    },

    isDark() {
      nextTick(() => {
        this.drawDiagram(this.blocks);
      });
    },

    themeColors: {
      handler() {
        nextTick(() => {
          this.drawDiagram(this.blocks);
        });
      },
      deep: true
    }
  }
}).use(vuetify).mount('#app');