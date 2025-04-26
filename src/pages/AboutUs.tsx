import React from "react"
import { Mail, Phone, Building, Users, Award, Heart, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
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
  {
    label: "Team",
    icon: <Users className="h-5 w-5" />,
  },
];

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
            >
              About Tuterra
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground leading-relaxed"
            >
              At Tuterra, we're redefining what modern learning looks like by bridging the gap between academic knowledge and real-world application.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Navigation Tabs Section */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="story" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-4 bg-transparent">
              {NAVIGATION_ITEMS.map((item) => (
                <TabsTrigger
                  key={item.label.toLowerCase()}
                  value={item.label.toLowerCase()}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
            <Separator className="my-8" />
            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {tab.content}
                </motion.div>
              </TabsContent>
            ))}
            <TabsContent value="team">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full overflow-hidden relative h-full rounded-2xl p-10"
              >
                <h3 className="text-2xl font-bold mb-4">Our Team</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our team consists of passionate educators, technologists, and innovators committed to transforming education through AI-powered solutions.
                </p>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-10 md:space-y-16">
            {/* Overview */}
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold">Our Story</h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Born from a vision to empower learners from all backgrounds, Tuterra is an AI-powered learning platform designed to equip students with the skills, context, and confidence needed to thrive in a fast-evolving job market. From real-world case study quizzes and job interview simulations to dynamic skill assessments, Tuterra transforms passive study into active preparation for life.
              </p>
            </div>

            {/* Mission */}
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold">Our Mission</h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Our mission is to restore purpose and relevance to education. We exist to empower a generation of learners with tools that don't just help them pass exams, but prepare them to lead, innovate, and solve real problems. We believe that access to quality, contextual learning should not be a privilege for students at top schools, it's a right that fuels economic freedom and national transformation.
              </p>
            </div>

            {/* Who We Serve */}
            <div className="space-y-6 md:space-y-8">
              <h2 className="text-2xl md:text-3xl font-bold">Who We Serve</h2>
              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                <Card className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Students & Job Seekers</h3>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Students and working professionals eager to close the gap between what they've learned and what the world demands. Whether they're preparing for a job interview, building confidence in core subjects, or discovering their talents, Tuterra meets them where they are.
                  </p>
                </Card>
                <Card className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Educators & Institutions</h3>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Forward-thinking schools, educators, and ministries looking to integrate AI tools that reinforce classroom teaching, track performance, and make learning measurable and impactful.
                  </p>
                </Card>
                <Card className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Governments & Foundations</h3>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Stakeholders committed to scalable educational reform and youth employment. Tuterra provides data-driven insight and adaptable tools that support national development goals.
                  </p>
                </Card>
              </div>
            </div>

            {/* Vision */}
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold">Our Vision</h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                We envision a world where education becomes an even more powerful lever for transformation. Where institutional education does not exist for its own sake. A world where students are adequately prepared and equipped to go out and solve problems in this world we have been entrusted to nurture.
                <br /><br />
                For us, learning is not just about acquiring knowledge, it's about unleashing destiny.
              </p>
            </div>

            {/* Contact Section */}
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold">Contact Us</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" className="gap-2">
                  <Mail className="w-4 h-4" />
                  Support@tuterra.ai
                </Button>
                <Button variant="outline" className="gap-2">
                  <Phone className="w-4 h-4" />
                  +1 (202)-827-5194
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
