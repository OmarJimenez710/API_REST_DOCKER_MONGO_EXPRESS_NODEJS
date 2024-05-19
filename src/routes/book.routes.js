const express = require("express");
const router = express.Router();
const Book = require("../models/book.model");

//MIDDLEWARE
//verifica si un determinado libro existe
const getBook = async (req, res, next) => {
  let book;
  //vamos a extraer los param de la url
  const { id } = req.params;

  //verificar si es un id valido en mongo
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({
      message: "El id del libro no es valido",
    });
  }

  try {
    book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        message: "El libro no fue encontrado",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }

  //en caso de que no de ningun error y el libro EXISTA va a configurar la respuesta y va a seguir
  res.book = book;
  next();
};

//Obtener todos los libros
router.get("/", async (req, resp) => {
  try {
    const books = await Book.find(); //busca todos los libreos

    //en caso de no tener nada la base de datos
    if (books.length == 0) {
      return resp.status(204).json([]);
    }

    resp.json(books);
  } catch (error) {
    resp.status(500).json({ message: error.message });
  }
});

//crear un nuevo libro (crear recurso)
router.post("/", async (req, resp) => {
  //reestructuramos todo lo que tiene el body (osea el objeto que vamos a agregar a a base de datos)
  const { title, author, genre, publication_date, original_language } =
    req?.body;

  //verificamos que venga la info completa
  if (!title || !author || !genre || !publication_date || !original_language) {
    return resp.status(400).json({ message: "Los campos no están completos" });
  }

  //en caso que todo ok, se crea el objeto
  const book = new Book({
    title,
    author,
    genre,
    publication_date,
    original_language,
  });

  try {
    const newBook = await book.save();
    resp.status(201).json(newBook);
  } catch (error) {
    resp.status(400).json({
      message: error.message,
    });
  }
});

//getBook es el middleware que creamos arriba y que aqui le decimos de alguna forma 'Sabes que, primero que pase el middleware, y ya despues ejecuta esto'
router.get("/:id", getBook, (req, resp) => {
  resp.json(resp.book); //se pude poner resp.book, porque ya como en el middleware se agrego el book a la respuesta (ver middleware)
});

router.put("/:id", getBook, async (req, res) => {
  try {
    const book = res.book;

    book.title = req.body.title || book.title;
    book.author = req.body.author || book.author;
    book.genre = req.body.genre || book.genre;
    book.publication_date = req.body.publication_date || book.publication_date;
    book.original_language =
      req.body.original_language || book.original_language;

    const updateBook = await book.save();

    res.json(updateBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//El cliente puede enviar 1 solo argumento para realizar el cambio
router.patch("/:id", getBook, async (req, res) => {
  if (
    !req.body.title &&
    !req.body.author &&
    !req.body.genre &&
    !req.body.publication_date &&
    !req.body.original_language
  ) {
    res.status(400).json({
      message: "Al menos uno de los campos a editar debe ser enviado",
    });
  }

  try {
    const book = res.book;

    book.title = req.body.title || book.title;
    book.author = req.body.author || book.author;
    book.genre = req.body.genre || book.genre;
    book.publication_date = req.body.publication_date || book.publication_date;
    book.original_language =
      req.body.original_language || book.original_language;

    const updateBook = await book.save();

    res.json(updateBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", getBook, async (req, resp) => {
  try {
    const deleteBook = resp.book;
    await deleteBook.deleteOne();

    resp.json({
      message: `El libro ${deleteBook.title} ha sido eliminado`,
    });
  } catch (error) {
    resp.status(500).json({ message: error.message });
  }
});

//exportamos las rutas
module.exports = router;
