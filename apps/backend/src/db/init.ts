import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const intializeDB = async () => {
    const users = await prisma.user.findMany()
    if (users.length === 0) {
        const salt = bcrypt.genSaltSync(10)
        const user = await prisma.user.create({
            data: {
                username: 'user1',
                firstName: 'user1',
                lastName: 'example',
                email: 'user1@example.com',
                password: bcrypt.hashSync('user1', salt),
                salt: salt,
            },
        })
    } else {
        // delete users with email = "labalette.antoine@gmail.com"
        // const user = await prisma.user.deleteMany({
        // 	where: {
        // 		email: "labalette.antoine@gmail.com"
        // 	}
        // })
        // console.log(user)
    }
}

export default intializeDB
