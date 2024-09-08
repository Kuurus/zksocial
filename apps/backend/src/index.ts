import express, { Request, Response } from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import { User } from "./entities/User";
import { Profile } from "./entities/Profile";
import { Swipe } from "./entities/Swipes";
import { ethers } from "ethers";
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3000;
const GRAPHQL_URL = "https://indexer.bigdevenergy.link/af4c80c/v1/graphql";

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize TypeORM data source
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");

    app.post("/authenticate", async (req: Request, res: Response) => {
      const { signature, walletAddress, gender } = req.body;

      if (!signature || !walletAddress) {
        return res.status(400).json({ message: "Signature and wallet address are required." });
      }

      try {
        // Step 1: Verify the signature
        const message = "Sign this message to connect with Kinto.";
        const recoveredAddress = ethers.verifyMessage(message, signature);

        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
          return res.status(400).json({ message: "Invalid signature." });
        }

        // Step 2: Make a GraphQL request to check Kinto Wallet Factory creations
        const graphQLQuery = {
          query: `
            query GetKintoWalletFactoryCreations($first: Int = 10, $skip: Int = 0) {
              KintoWalletFactory_KintoWalletFactoryCreation(
                order_by: { id: desc }
              ) {
                id
                account
                owner
                version
                db_write_timestamp
              }
            }
          `
        };
    
        const graphQLResponse = await axios.post(GRAPHQL_URL, graphQLQuery, {
          headers: { "Content-Type": "application/json" }
        });
    
        const graphQLData = graphQLResponse.data;
        if (!graphQLData.data) {
          return res.status(500).json({ message: "Failed to fetch data from the subgraph." });
        }

        // For testing purposes this is commented out
        // Step 3: Check if the wallet address exists in the returned accounts
        const kintoWallets = graphQLData.data.KintoWalletFactory_KintoWalletFactoryCreation;
        const foundAccount = kintoWallets.find((wallet: { owner: string }) => wallet.owner.toLowerCase() === walletAddress.toLowerCase());
        console.log(foundAccount)
    
        // if (!foundAccount) {
        //   return res.status(400).json({ message: "Wallet not found in Kinto Wallet Factory creations." });
        // }

        // Step 4: Find or create the user in your database
        const userRepository = AppDataSource.getRepository(User);
        let user = await userRepository.findOneBy({ walletAddress });
        let isNewUser = false;

        if (!user) {
          // Signup
          if (!gender) {
            return res.status(400).json({ message: "Gender is required for new users." });
          }
          user = userRepository.create({ walletAddress, isVerified: true, gender });
          isNewUser = true;
        } else {
          user.isVerified = true;
        }

        const isOnboardingDone = await AppDataSource.getRepository(Profile)
          .findOneBy({ user: { id: user.id } })
          .then(profile => profile !== null);

        await userRepository.save(user);

        const responseMessage = isNewUser ? "User registered and verified successfully." : "User authenticated successfully.";
        res.status(200).json({ message: responseMessage, user, isNewUser, isOnboardingDone });
      } catch (error) {
        console.error("Error authenticating user:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });


    app.post("/profile", async (req: Request, res: Response) => {
      const { userId, bio, age, location, name, image } = req.body;

      try {
        const userRepository = AppDataSource.getRepository(User);
        const profileRepository = AppDataSource.getRepository(Profile);

        const user = await userRepository.findOneBy({ id: userId, gender: "male" });

        if (!user) {
          return res.status(404).json({ message: "User not found or not a male user." });
        }

        let profile = await profileRepository.findOneBy({ user: { id: userId } });

        if (profile) {
          profile.bio = bio;
          profile.age = age;
          profile.location = location;
          profile.name = name;
          profile.image = image;
        } else {
          profile = profileRepository.create({
            user,
            bio,
            age,
            location,
            name,
            image,
          });
        }

        const savedProfile = await profileRepository.save(profile);
        res.status(200).json(savedProfile);
      } catch (error) {
        console.error("Error creating/updating profile:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });


    app.get("/profile", async (req: Request, res: Response) => {
      const { userId } = req.query as { userId?: string };
      if (!userId) {
        return res.status(400).json({ message: "User ID is required." });
      }
      try {
        const userRepository = AppDataSource.getRepository(User);
        const profileRepository = AppDataSource.getRepository(Profile);

        const user = await userRepository.findOneBy({ id: userId, gender: "male" });

        if (!user) {
          return res.status(404).json({ message: "User not found or not a male user." });
        }

        const profile = await profileRepository.findOneBy({ user: { id: userId } });

        if (!profile) {
          return res.status(404).json({ message: "Profile not found." });
        }

        res.status(200).json(profile);
      } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });


    app.get("/profiles", async (req: Request, res: Response) => {
      const { userId } = req.query;
    
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ message: "Valid User ID is required." });
      }
    
      try {
        const profileRepository = AppDataSource.getRepository(Profile);
        const swipeRepository = AppDataSource.getRepository(Swipe);
    
        const profilesQuery = profileRepository
          .createQueryBuilder("profile")
          .leftJoinAndSelect("profile.user", "user")
          .where("user.gender = :gender", { gender: "male" });
    
        const swipedProfileIds = await swipeRepository
          .createQueryBuilder("swipe")
          .select("swipe.targetProfile.id")
          .where("swipe.swiper = :userId", { userId })
          .getRawMany();
    
        const swipedIds = swipedProfileIds.map(swipe => swipe.targetProfile_id);
    
        if (swipedIds.length > 0) {
          profilesQuery.andWhere("profile.id NOT IN (:...swipedIds)", { swipedIds });
        }
    
        const profiles = await profilesQuery.getMany();
    
        const anonymizedProfiles = profiles.map(profile => ({
          id: profile.id,
          bio: profile.bio || null,
          age: profile.age || null,
          location: profile.location || null,
          image: profile.image || null,
          // Exclude sensitive fields like `name` and any user-related details
        }));
    
        res.status(200).json(anonymizedProfiles);
      } catch (error) {
        console.error("Error fetching profiles:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });


    app.post("/swipe", async (req: Request, res: Response) => {
      const { userId, profileId, action } = req.body;

      if (!userId || !profileId || !action || (action !== "like" && action !== "dislike")) {
        return res.status(400).json({ message: "Invalid request data." });
      }

      try {
        const userRepository = AppDataSource.getRepository(User);
        const profileRepository = AppDataSource.getRepository(Profile);
        const swipeRepository = AppDataSource.getRepository(Swipe);

        const swiper = await userRepository.findOneBy({ id: userId, gender: "female" });
        if (!swiper) {
          return res.status(404).json({ message: "User not found or not a female user." });
        }

        const targetProfile = await profileRepository.findOneBy({ id: profileId });
        if (!targetProfile) {
          return res.status(404).json({ message: "Profile not found." });
        }

        const existingSwipe = await swipeRepository.findOneBy({ swiper: { id: userId }, targetProfile: { id: profileId } });
        if (existingSwipe) {
          return res.status(400).json({ message: "You have already swiped on this profile." });
        }

        const newSwipe = swipeRepository.create({
          swiper,
          targetProfile,
          action
        });

        const savedSwipe = await swipeRepository.save(newSwipe);

        res.status(200).json({ message: `You have ${action}d the profile.`, swipe: savedSwipe });
      } catch (error) {
        console.error("Error swiping profile:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });


    app.get("/matches", async (req: Request, res: Response) => {
      const { userId } = req.query;
    
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ message: "Valid User ID is required." });
      }
    
      try {
        const userRepository = AppDataSource.getRepository(User);
        const swipeRepository = AppDataSource.getRepository(Swipe);
        const profileRepository = AppDataSource.getRepository(Profile);
    
        const user = await userRepository.findOneBy({ id: userId });
        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }
    
        interface Match {
          walletAddress: string;
          bio: string | null;
          age: number | null;
          location: string | null;
          image: string | null;
        }
        let matches: Match[] = [];

    
        if (user.gender === "female") {
          const likedSwipes = await swipeRepository
            .createQueryBuilder("swipe")
            .leftJoinAndSelect("swipe.targetProfile", "profile")
            .leftJoinAndSelect("profile.user", "user")
            .where("swipe.swiper = :userId", { userId })
            .andWhere("swipe.action = :action", { action: "like" })
            .andWhere("user.gender = :gender", { gender: "male" })
            .getMany();
    
          matches = likedSwipes.map(swipe => ({
            walletAddress: swipe.targetProfile.user.walletAddress,
            bio: swipe.targetProfile.bio ?? null,
            age: swipe.targetProfile.age ?? null,
            location: swipe.targetProfile.location ?? null,
            image: swipe.targetProfile.image ?? null,
          }));
    
        } else if (user.gender === "male") {
          const swipesOnProfile = await swipeRepository
            .createQueryBuilder("swipe")
            .leftJoinAndSelect("swipe.swiper", "user")
            .leftJoinAndSelect("user.profile", "profile")
            .where("swipe.targetProfile = :userId", { userId })
            .andWhere("swipe.action = :action", { action: "like" })
            .andWhere("user.gender = :gender", { gender: "female" })
            .getMany();
    
          matches = swipesOnProfile.map(swipe => ({
            walletAddress: swipe.swiper.walletAddress,
            bio: swipe.swiper.profile?.bio ?? null,
            age: swipe.swiper.profile?.age ?? null,
            location: swipe.swiper.profile?.location ?? null,
            image: swipe.swiper.profile?.image ?? null,
          }));
        }
    
        if (matches.length === 0) {
          return res.status(200).json({ message: "No matches found." });
        }
    
        return res.status(200).json({ matches });
      } catch (error) {
        console.error("Error fetching matches:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
    });

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });
