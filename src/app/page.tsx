"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function Home() {
  const [appToken, setAppToken] = useState<object | null>(null);
  const { data: session, status, update } = useSession();

  const getAppToken = async () =>
    await fetch("/api/app")
      .then((res) => (res.ok && res) || Promise.reject(res))
      .then((res) => res.json())
      .then((res) =>
        JSON.parse(
          Buffer.from(res.access_token.split(".")[1], "base64").toString(
            "ascii"
          )
        )
      )
      .catch((res) => res.json());
  return (
    <main className="grid grid-cols-2 items-center justify-items-center min-h-screen font-[family-name:var(--font-geist-sans)]">
      <div className="grid grid-cols-1 items-center justify-items-center">
        <h5 className="text-lg py-4">Partner App</h5>
        <button
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 my-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          onClick={() => signIn("customapp")}
        >
          Connect DescoperSite
        </button>
        {session && session?.user && (
          <pre className="overflow-auto max-w-full">
            Session:{" "}
            {JSON.stringify(
              {
                ...session,
                user: {
                  ...session.user,
                  id_token: session.user.id_token
                    ? JSON.parse(session.user.id_token)
                    : "",
                },
              },
              null,
              2
            )}
          </pre>
        )}
        {session && (
          <>
            <button
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 my-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              onClick={() => update({ refresh: true })}
            >
              Refresh
            </button>
            <button
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 my-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              onClick={() => signOut()}
            >
              Sign Out
            </button>
          </>
        )}
      </div>
      <div className="grid grid-cols-1 items-center justify-items-center">
        <h5 className="text-lg py-4">Partner Backend</h5>
        <button
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 my-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          onClick={async () => setAppToken(await getAppToken())}
        >
          Get App Token
        </button>
        <hr />
        {appToken && (
          <pre className="overflow-auto max-w-full">
            App Token: {JSON.stringify(appToken, null, 2)}
          </pre>
        )}
      </div>
    </main>
  );
}
