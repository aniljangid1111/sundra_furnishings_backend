import argon2 from "argon2";

// Password ko secure hash mein convert karta hai
export const hashPassword = async (password: string) => {
  return await argon2.hash(password);
};

// Password ko stored hash ke saath verify karta hai
export const verifyPassword = async (
  password: string,
  hash: string,
) => {
  return await argon2.verify(hash, password);
};