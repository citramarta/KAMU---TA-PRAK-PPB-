// Pembungkus controller: menjalankan fungsi, mengirim JSON, dan menerjemahkan error Postgres.
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const notFound = (what) => new HttpError(404, `${what} tidak ditemukan`);

export const badRequest = (message) => new HttpError(400, message);

export const handle = (fn, successStatus = 200) => async (req, res) => {
  try {
    const result = await fn(req);
    res.status(successStatus).json(result);
  } catch (err) {
    let status = err.status || 500;
    let message = err.message;

    if (err.code === "23505") { status = 409; message = "Data sudah ada (duplikat)"; }
    else if (err.code === "23503") { status = 400; message = "Referensi data tidak valid"; }
    else if (err.code === "23514") { status = 400; message = "Nilai tidak memenuhi aturan data"; }
    else if (err.code === "23502") { status = 400; message = "Ada field wajib yang belum diisi"; }
    else if (err.code === "22P02") { status = 400; message = "Format ID/nilai tidak valid"; }

    res.status(status).json({ error: message });
  }
};
