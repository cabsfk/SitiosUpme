
BootstrapDialog.show({
    title: 'NOTA ACLARATORIA',
    message: notaAclaratoria,
    closable: false,

    buttons: [
      {
          label: 'Entiendo la Aclaración',
          cssClass: 'btn-success',
          action: function (dialogRef) {
              dialogRef.close();
          }
      }]
});