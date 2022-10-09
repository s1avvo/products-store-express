class ValidationError extends Error {}
class NotFoundError extends Error {}

function handleError(err, req, res, next) {

  if(err instanceof NotFoundError){
    res
        .status(404)
        .json({ message: 'Nie można znaleźć elementu danym ID' })
    return;
  }

  res
      .status(err instanceof ValidationError ? 400 : 500)
      .json({ message: err instanceof ValidationError ? err.message : 'Przepraszamy mamy problemy techniczne' });
}

module.exports = {
  handleError,
  ValidationError,
  NotFoundError,
}