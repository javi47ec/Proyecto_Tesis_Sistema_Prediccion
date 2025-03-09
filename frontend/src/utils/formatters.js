/**
 * Formatea un número a moneda (MXN)
 * @param {number} amount - Cantidad a formatear
 * @returns {string} - Cantidad formateada como moneda
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };
  
  /**
   * Formatea una fecha a un formato legible
   * @param {string|Date} date - Fecha a formatear
   * @returns {string} - Fecha formateada
   */
  export const formatDate = (date) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    
    return new Date(date).toLocaleDateString('es-MX', options);
  };