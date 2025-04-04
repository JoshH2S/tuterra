
import { motion } from "framer-motion";
import { Activity, Book, Calendar, MessageSquare, Star, Users } from "lucide-react";

const cards = [
  {
    icon: <Book className="w-6 h-6 text-white" />,
    title: "Course Library",
    value: "2,000+",
    color: "bg-blue-600"
  },
  {
    icon: <Users className="w-6 h-6 text-white" />,
    title: "Active Users",
    value: "50,000+",
    color: "bg-purple-500"
  },
  {
    icon: <Star className="w-6 h-6 text-white" />,
    title: "Success Rate",
    value: "94%",
    color: "bg-yellow-500"
  },
  {
    icon: <Calendar className="w-6 h-6 text-white" />,
    title: "Daily Sessions",
    value: "10,000+",
    color: "bg-green-500"
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-white" />,
    title: "Community Posts",
    value: "25,000+",
    color: "bg-pink-500"
  },
  {
    icon: <Activity className="w-6 h-6 text-white" />,
    title: "Learning Hours",
    value: "1M+",
    color: "bg-orange-500"
  }
];

export function FloatingCards() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#091747] to-blue-400 dark:from-[#091747] dark:to-blue-500">
            Trusted by Thousands of Learners
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join our growing community of students and educators
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {cards.map((card, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700"
            >
              <div className={`w-12 h-12 ${card.color} rounded-full flex items-center justify-center mb-4`}>
                {card.icon}
              </div>
              <h3 className="text-2xl font-bold mb-1">{card.value}</h3>
              <p className="text-gray-600 dark:text-gray-400">{card.title}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
