import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, getDoc, doc, limit, where } from 'firebase/firestore';
import { db } from './firebase';
import { Post, User } from './data';

export function useFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const usersRef = useRef<Record<string, User>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const newPosts: any[] = [];
      const newUsers = { ...usersRef.current };
      let usersChanged = false;

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const authorId = data.authorId;
        
        if (!newUsers[authorId]) {
          const userSnap = await getDoc(doc(db, 'users', authorId));
          if (userSnap.exists()) {
            newUsers[authorId] = { id: userSnap.id, ...userSnap.data() } as User;
            usersChanged = true;
          }
        }

        newPosts.push({
          id: docSnap.id,
          ...data,
          timestamp: data.createdAt?.toDate() || new Date(),
          authorId
        });
      }

      if (usersChanged) {
        usersRef.current = newUsers;
      }
      
      setPosts(newPosts.map(p => ({
        ...p,
        author: usersRef.current[p.authorId]
      })) as Post[]);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { posts, loading };
}

export function useUserPosts(userId: string | undefined) {
  const [posts, setPosts] = useState<Post[]>([]);
  const usersRef = useRef<Record<string, User>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'posts'), where("authorId", "==", userId), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const newPosts: any[] = [];
      const newUsers = { ...usersRef.current };
      let usersChanged = false;

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const authorId = data.authorId;
        
        if (!newUsers[authorId]) {
          const userSnap = await getDoc(doc(db, 'users', authorId));
          if (userSnap.exists()) {
            newUsers[authorId] = { id: userSnap.id, ...userSnap.data() } as User;
            usersChanged = true;
          }
        }

        newPosts.push({
          id: docSnap.id,
          ...data,
          timestamp: data.createdAt?.toDate() || new Date(),
          authorId
        });
      }

      if (usersChanged) {
        usersRef.current = newUsers;
      }
      
      setPosts(newPosts.map(p => ({
        ...p,
        author: usersRef.current[p.authorId]
      })) as Post[]);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { posts, loading };
}

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create an independent ref for notifications user cache
  const usersRef = useRef<Record<string, User>>({});

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'users', userId, 'notifications'), orderBy('createdAt', 'desc'), limit(30));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const notifs = [];
      const userCache = { ...usersRef.current } as any;
      let usersChanged = false;

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const actorId = data.actorId;
        
        if (!userCache[actorId]) {
          const userSnap = await getDoc(doc(db, 'users', actorId));
          if (userSnap.exists()) {
            userCache[actorId] = { id: userSnap.id, ...userSnap.data() };
            usersChanged = true;
          }
        }
        notifs.push({
          id: docSnap.id,
           ...data,
           actor: userCache[actorId],
           timestamp: data.createdAt?.toDate() || new Date(),
        })
      }
      
      if (usersChanged) {
        usersRef.current = userCache;
      }

      setNotifications(notifs);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userId]);

  return { notifications, loading };
}
