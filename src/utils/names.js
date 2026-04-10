export const firstNames = [
  "Tony", "Bruce", "Naruto", "Monkey D.", "Jon", "Tokyo", "Walter", "Clark", 
  "Peter", "Jesse", "Sasuke", "Zoro", "Arya", "Denver", "Saul", "Harry", 
  "Levi", "Mikasa", "Eren", "Goku", "Saitama", "Arthur", "Thomas"
];

export const lastNames = [
  "Stark", "Wayne", "Uzumaki", "Luffy", "Snow", "Professor", "White", "Kent", 
  "Parker", "Pinkman", "Uchiha", "Lannister", "Goodman", "Targaryen", "Hatake", 
  "Potter", "Ackerman", "Yeager", "Shelby", "Morgan"
];

export const generateFictionalName = () => {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${last}`;
};