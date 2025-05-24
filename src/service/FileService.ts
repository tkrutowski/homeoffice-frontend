import moment from 'moment'

export const FileService = {
    // Metoda zwracająca ikonę dla typu pliku
    getFileIcon(fileType: string): string {
        if (fileType.includes('pdf')) return 'pi pi-file-pdf';
        if (fileType.includes('image')) return 'pi pi-image';
        if (fileType.includes('word')) return 'pi pi-file-word';
        if (fileType.includes('excel')) return 'pi pi-file-excel';
        return 'pi pi-file';
    },

    // Metoda zwracająca etykietę dla typu pliku
    getFileTypeLabel(fileType: string): string {
        if (fileType.includes('pdf')) return 'PDF';
        if (fileType.includes('image')) return 'Obraz';
        if (fileType.includes('word')) return 'Word';
        if (fileType.includes('excel')) return 'Excel';
        return 'Inny';
    },

    // Metoda zwracająca kolor dla typu pliku
    getFileTypeSeverity(fileType: string): string {
        if (fileType.includes('pdf')) return 'danger';
        if (fileType.includes('image')) return 'info';
        if (fileType.includes('word')) return 'primary';
        if (fileType.includes('excel')) return 'success';
        return 'secondary';
    },

    formatDate(date: Date): string {
        return moment(date).format('DD.MM.YYYY HH:mm:ss');
    },

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    }
}
