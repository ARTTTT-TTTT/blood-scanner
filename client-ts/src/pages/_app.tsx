import "@/styles/globals.css";
import Head from "next/head";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@material-tailwind/react";
import { Layout } from "@/components";
import { itim, theme } from "@/styles/theme";
import { QueryClient, QueryClientProvider } from "react-query";

// Create a QueryClient instance
const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <div className={`${itim.variable} font-itim`}>
            <ThemeProvider value={theme}>
                <QueryClientProvider client={queryClient}>
                    <Head>
                        <title>Blood Scanner</title>
                        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                        <link rel="icon" href="/favicon.png" />
                    </Head>
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                </QueryClientProvider>
            </ThemeProvider>
        </div>
    );
}

export default MyApp;
