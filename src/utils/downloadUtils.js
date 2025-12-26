/**
 * Utilidades para descargar archivos desde diferentes formatos
 * Útil para reportes y documentos generados por el servidor
 */

/**
 * Descarga un archivo desde una cadena base64
 * @param {string} base64String - La cadena base64 del archivo (sin el prefijo data:)
 * @param {string} mimeType - El tipo MIME del archivo (ej: 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
 * @param {string} fileName - El nombre del archivo a descargar
 */
export const downloadFromBase64 = (base64String, mimeType, fileName) => {
    try {
        // Validar parámetros
        if (!base64String) {
            throw new Error('La cadena base64 es requerida');
        }
        if (!mimeType) {
            throw new Error('El tipo MIME es requerido');
        }
        if (!fileName) {
            throw new Error('El nombre del archivo es requerido');
        }

        // Convertir base64 a bytes
        const byteCharacters = atob(base64String);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);

        // Crear blob
        const blob = new Blob([byteArray], { type: mimeType });

        // Crear URL temporal
        const url = window.URL.createObjectURL(blob);

        // Crear elemento de descarga
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';

        // Agregar al DOM, hacer clic y remover
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Limpiar URL temporal
        window.URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error('Error al descargar archivo desde base64:', error);
        throw error;
    }
};

/**
 * Descarga un archivo desde un Blob
 * @param {Blob} blob - El objeto Blob del archivo
 * @param {string} fileName - El nombre del archivo a descargar
 */
export const downloadFromBlob = (blob, fileName) => {
    try {
        if (!blob || !(blob instanceof Blob)) {
            throw new Error('Se requiere un objeto Blob válido');
        }
        if (!fileName) {
            throw new Error('El nombre del archivo es requerido');
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error('Error al descargar archivo desde Blob:', error);
        throw error;
    }
};

/**
 * Abre un archivo en una nueva ventana desde base64
 * @param {string} base64String - La cadena base64 del archivo
 * @param {string} mimeType - El tipo MIME del archivo
 */
export const openFromBase64 = (base64String, mimeType) => {
    try {
        if (!base64String) {
            throw new Error('La cadena base64 es requerida');
        }
        if (!mimeType) {
            throw new Error('El tipo MIME es requerido');
        }

        const dataUrl = `data:${mimeType};base64,${base64String}`;
        window.open(dataUrl, '_blank');

        return true;
    } catch (error) {
        console.error('Error al abrir archivo desde base64:', error);
        throw error;
    }
};

/**
 * Abre un archivo en una nueva ventana desde un Blob
 * @param {Blob} blob - El objeto Blob del archivo
 */
export const openFromBlob = (blob) => {
    try {
        if (!blob || !(blob instanceof Blob)) {
            throw new Error('Se requiere un objeto Blob válido');
        }

        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');

        // Limpiar URL después de un tiempo para liberar memoria
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
        }, 1000);

        return true;
    } catch (error) {
        console.error('Error al abrir archivo desde Blob:', error);
        throw error;
    }
};

/**
 * Maneja la descarga de un archivo según el tipo de respuesta de la API
 * @param {Object} response - La respuesta de la API
 * @param {string} defaultFileName - Nombre por defecto del archivo
 * @param {Object} options - Opciones adicionales
 * @param {boolean} options.openInNewWindow - Si true, abre en nueva ventana en lugar de descargar
 */
export const handleFileResponse = (response, defaultFileName, options = {}) => {
    try {
        const { openInNewWindow = false } = options;

        // Si la respuesta es un Blob
        if (response instanceof Blob) {
            if (openInNewWindow) {
                return openFromBlob(response);
            } else {
                return downloadFromBlob(response, defaultFileName);
            }
        }

        // Si la respuesta tiene una URL directa
        if (response.url) {
            window.open(response.url, '_blank');
            return true;
        }

        // Si la respuesta tiene base64
        if (response.base64 || response.data) {
            const base64String = response.base64 || response.data;
            const mimeType = response.mimeType || response.contentType || 'application/octet-stream';
            const fileName = response.fileName || defaultFileName;

            if (openInNewWindow) {
                return openFromBase64(base64String, mimeType);
            } else {
                return downloadFromBase64(base64String, mimeType, fileName);
            }
        }

        // Si la respuesta tiene un archivo como string base64 simple
        if (typeof response === 'string' && response.length > 100) {
            // Asumir que es base64 y tipo PDF por defecto
            const mimeType = 'application/pdf';

            if (openInNewWindow) {
                return openFromBase64(response, mimeType);
            } else {
                return downloadFromBase64(response, mimeType, defaultFileName);
            }
        }

        throw new Error('Formato de respuesta no reconocido');

    } catch (error) {
        console.error('Error al manejar respuesta de archivo:', error);
        throw error;
    }
};

/**
 * Tipos MIME comunes para diferentes tipos de archivos
 */
export const MIME_TYPES = {
    PDF: 'application/pdf',
    EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    EXCEL_OLD: 'application/vnd.ms-excel',
    WORD: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    WORD_OLD: 'application/msword',
    CSV: 'text/csv',
    TEXT: 'text/plain',
    JSON: 'application/json',
    XML: 'application/xml',
    ZIP: 'application/zip',
    IMAGE_PNG: 'image/png',
    IMAGE_JPG: 'image/jpeg',
    IMAGE_GIF: 'image/gif'
};

/**
 * Genera un nombre de archivo con timestamp
 * @param {string} baseName - Nombre base del archivo
 * @param {string} extension - Extensión del archivo (sin punto)
 * @returns {string} Nombre del archivo con timestamp
 */
export const generateFileNameWithTimestamp = (baseName, extension) => {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
    return `${baseName}_${timestamp}.${extension}`;
};

/**
 * Obtiene la extensión de archivo según el tipo MIME
 * @param {string} mimeType - Tipo MIME
 * @returns {string} Extensión del archivo
 */
export const getFileExtensionFromMimeType = (mimeType) => {
    const extensions = {
        'application/pdf': 'pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        'application/vnd.ms-excel': 'xls',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/msword': 'doc',
        'text/csv': 'csv',
        'text/plain': 'txt',
        'application/json': 'json',
        'application/xml': 'xml',
        'application/zip': 'zip',
        'image/png': 'png',
        'image/jpeg': 'jpg',
        'image/gif': 'gif'
    };

    return extensions[mimeType] || 'bin';
};