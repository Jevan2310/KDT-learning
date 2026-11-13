import "./App.css";
import TodoList from "./components/TodoList";
import BookList from "./components/BookList";
import { ShoppingList } from "./components/ShoppingList";

const App = () =>{
  return <>
    <TodoList/>
    <BookList/>
    <ShoppingList/>
  </>
}

export default App;