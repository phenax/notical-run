import { hashPassword, lucia } from '../auth';
import { db } from '../db';
import { User, UserType } from '../db/schema';

export const userFactory = async (user?: Partial<UserType>): Promise<UserType> => ({
  name: 'Ozzy Osbourne',
  email: 'ozzy@email.com',
  ...user,
  password: await hashPassword(user?.password ?? '123123123'),
});

export const createUser = async (user?: Partial<UserType>) => {
  const newUser = await db
    .insert(User)
    .values(await userFactory(user))
    .returning({ id: User.id, name: User.name, email: User.email });

  return newUser[0];
};

export const createSession = (userId: string) => {
  return lucia.createSession(userId, {});
};