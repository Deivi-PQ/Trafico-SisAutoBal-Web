import React from "react";

const EditableTable = ({ columns, data, onChange, inputType = "number" }) => {
  // Manejar el cambio de celda
  const handleCellChange = (rowIdx, key, value) => {
    const newData = data.map((row, idx) =>
      idx === rowIdx ? { ...row, [key]: value } : row
    );
    onChange(newData);
  };

  return (
    <table className="min-w-full border border-black text-xs">
      <thead>
        <tr className="bg-black text-white">
          {columns.map((col) => (
            <th
              key={col.key}
              className="border border-black px-2 py-1"
              style={col.hidden ? { display: 'none' } : {}}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIdx) => (
          <tr key={row.desc || rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`border border-black px-2 py-1 ${col.key === 'desc' ? 'font-semibold' : ''} ${col.key === 'um' ? '' : ''} ${col.key === 'comentario' ? 'text-blue-700' : ''} ${col.key === 'estatus' ? 'text-center' : ''}`}
                    style={col.hidden ? { display: 'none' } : {}}
                  >
                    {col.key === 'desc' || col.key === 'um' ? (
                      <span>{row[col.key]}</span>
                    ) : col.key === 'estatus' ? (
                      <span className={`inline-block w-4 h-4 rounded-full border border-gray-700 ${row.estatus === 'green' ? 'bg-green-500' : row.estatus === 'yellow' ? 'bg-yellow-400' : 'bg-red-600'}`}></span>
                    ) : col.key === 'comentario' ? (
                      <input
                        type="text"
                        value={row[col.key]}
                        onChange={e => handleCellChange(rowIdx, col.key, e.target.value)}
                        className="w-full text-[12px] p-0.5 text-black-800 text-center font-semibold border border-gray-300 rounded"
                      />
                    ) : (
                      <input
                        type={inputType}
                        value={row[col.key]}
                        onChange={e => handleCellChange(rowIdx, col.key, e.target.value)}
                        className="w-full text-[12px] p-0.5 text-black-800 text-center font-semibold border border-gray-300 rounded"
                      />
                    )}
                  </td>
                ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default EditableTable;
