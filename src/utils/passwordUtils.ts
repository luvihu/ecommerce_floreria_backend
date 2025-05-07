import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

export const comparePasswords = async ( password: string, hashedPassword: string ): Promise<boolean> => {
  const returnCompare = await bcrypt.compare(password, hashedPassword);
  return returnCompare;
};
