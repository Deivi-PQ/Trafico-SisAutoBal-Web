import React, { useState, useEffect } from 'react';
import { ComboBox } from '../../../Components/ui/combobox';
import { RecuperHijoT } from '../../../services/Global/Tabla/TablaService';

const ComboBoxTabla = ({
    value,
    onValueChange,
    placeholder = "Selecciona...",
    searchPlaceholder = "Buscar...",
    emptyMessage = "No se encontraron resultados",
    className,
    disabled = false,
    cdTabla = 0, // Código de tabla para tipos de carga
    ...props
}) => {
    const [items, setitems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar lista de items
    useEffect(() => {
        const cargarItems = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await RecuperHijoT(cdTabla);

                // Procesar los datos del items
                let itemsData = [];

                if (Array.isArray(response)) {
                    itemsData = response;
                }

                setitems(itemsData);
            } catch (err) {
                console.error('Error al cargar items:', err);
                setError(err.message || 'Error al cargar el items');
                setitems([]);
            } finally {
                setLoading(false);
            }
        };

        cargarItems();
    }, [cdTabla]);

    // Convertir items a formato de opciones para ComboBox
    const itemsOptions = items.map(p => {
        return {
            value: p.cdTabla,
            label: p.desTabla,
        };
    });

    // Manejar estado de carga
    if (loading) {
        return (
            <ComboBox
                options={[]}
                value=""
                onValueChange={() => { }}
                placeholder="Cargando items..."
                disabled={true}
                className={className}
                {...props}
            />
        );
    }

    // Manejar estado de error
    if (error) {
        return (
            <ComboBox
                options={[]}
                value=""
                onValueChange={() => { }}
                placeholder={`Error: ${error}`}
                disabled={true}
                className={className}
                {...props}
            />
        );
    }

    return (
        <ComboBox
            options={itemsOptions}
            value={String(value || '')}
            onValueChange={(newValue) => {
                onValueChange?.(newValue);
            }}
            placeholder={placeholder}
            searchPlaceholder={searchPlaceholder}
            emptyMessage={emptyMessage}
            className={className}
            disabled={disabled}
            {...props}
        />
    );
};

export default ComboBoxTabla;