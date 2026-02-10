import { useState } from "react";
import MultiStepForm from "@/components/form/MultiStepForm";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Index = () => {
  const [started, setStarted] = useState(false);

  if (started) {
    return <MultiStepForm />;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--gradient-hero)" }}>
      <header className="flex justify-end p-4 sm:p-6">
        <Link to="/admin">
          <Button variant="ghost" size="sm" className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 gap-2">
            <Shield className="w-4 h-4" /> Admin
          </Button>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-8">
            <ClipboardList className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-primary-foreground tracking-tight">
            Asset Assignment
          </h1>
          <p className="mt-4 text-lg text-primary-foreground/70 max-w-md mx-auto">
            Complete the form to register your assigned enterprise assets. All information is stored securely.
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-10"
          >
            <Button
              size="lg"
              onClick={() => setStarted(true)}
              className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90 gap-2 text-base px-8 py-6 shadow-elevated"
            >
              Let's Go <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </motion.div>
      </main>

      <footer className="text-center text-primary-foreground/40 text-xs pb-6">
        Enterprise Asset Management System
      </footer>
    </div>
  );
};

export default Index;
