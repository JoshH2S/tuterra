import React from "react"
import { motion } from "framer-motion"
import { Mail, Phone, Building, Users, Award, Heart, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const tabs = [
  {
    title: "Our Story",
    value: "story",
    content: (
      <div className="w-full overflow-hidden relative h-full rounded-2xl p-10">
        <h3 className="text-2xl font-bold mb-4">Our Story</h3>
        <p className="text-muted-foreground leading-relaxed">
          Born from a vision to empower learners from all backgrounds, Tuterra is an AI-powered learning platform designed to equip students with the skills, context, and confidence needed to thrive in a fast-evolving job market. From real-world case study quizzes and job interview simulations to dynamic skill assessments, Tuterra transforms passive study into active preparation for life.
        </p>
      </div>
    ),
  },
  {
    title: "Our Mission",
    value: "mission",
    content: (
      <div className="w-full overflow-hidden relative h-full rounded-2xl p-10">
        <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
        <p className="text-muted-foreground leading-relaxed">
          Our mission is to restore purpose and relevance to education. We exist to empower a generation of learners with tools that don't just help them pass exams, but prepare them to lead, innovate, and solve real problems. We believe that access to quality, contextual learning should not be a privilege for students at top schools, it's a right that fuels economic freedom and national transformation.
        </p>
      </div>
    ),
  },
  {
    title: "Our Vision",
    value: "vision",
    content: (
      <div className="w-full overflow-hidden relative h-full rounded-2xl p-10">
        <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
        <p className="text-muted-foreground leading-relaxed">
          We envision a world where education becomes an even more powerful lever for transformation. Where institutional education does not exist for its own sake. A world where students are adequately prepared and equipped to go out and solve problems in this world we have been entrusted to nurture.
          <br /><br />
          For us, learning is not just about acquiring knowledge, it's about unleashing destiny.
        </p>
      </div>
    ),
  },
];

const NAVIGATION_ITEMS = [
  {
    label: "Story",
    icon: <Building className="h-5 w-5" />,
  },
  {
    label: "Mission",
    icon: <Award className="h-5 w-5" />,
  },
  {
    label: "Vision",
    icon: <Heart className="h-5 w-5" />,
  },
 
];

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              About Tuterra
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              At Tuterra, we're redefining what modern learning looks like by bridging the gap between academic knowledge and real-world application.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="py-8 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="flex space-x-2 rounded-xl bg-background p-2 border">
              {NAVIGATION_ITEMS.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className="gap-2"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Content Sections */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="story" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="story">Our Story</TabsTrigger>
              <TabsTrigger value="mission">Our Mission</TabsTrigger>
              <TabsTrigger value="vision">Our Vision</TabsTrigger>
            </TabsList>
            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                <Card className="mt-6 border-2 hover:border-primary/20 transition-all duration-300">
                  {tab.content}
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-center mb-12">Who We Serve</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <h3 className="text-xl font-semibold mb-4">Students & Job Seekers</h3>
                <p className="text-muted-foreground">
                  Students and working professionals eager to close the gap between what they've learned and what the world demands. Whether they're preparing for a job interview, building confidence in core subjects, or discovering their talents, Tuterra meets them where they are.
                </p>
              </Card>
              <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <h3 className="text-xl font-semibold mb-4">Educators & Institutions</h3>
                <p className="text-muted-foreground">
                  Forward-thinking schools, educators, and ministries looking to integrate AI tools that reinforce classroom teaching, track performance, and make learning measurable and impactful.
                </p>
              </Card>
              <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <h3 className="text-xl font-semibold mb-4">Governments & Foundations</h3>
                <p className="text-muted-foreground">
                  Stakeholders committed to scalable educational reform and youth employment. Tuterra provides data-driven insight and adaptable tools that support national development goals.
                </p>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-8">Contact Us</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button variant="outline" size="lg" className="gap-2">
                <Mail className="w-4 h-4" />
                Support@tuterra.ai
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <Phone className="w-4 h-4" />
                +1 (202)-827-5194
              </Button>
            </div>
            <div className="mt-6 text-muted-foreground flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Address: 5000 Thayer Center STE C, Oakland, MD, 21550</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
