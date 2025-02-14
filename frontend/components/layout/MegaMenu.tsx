'use client'
import { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'

interface MegaMenuProps {
  category: string
}

const topLinks = ['Discover', 'Brands', 'Categories', 'Designers', 'Rankings']
const bottomLinks = ['Login', 'Liked Items', 'Saved Items', 'Submissions', 'About']
const discoverLinks = ['View All', 'Spotlight', 'Trending', 'Lookbooks', 'Location', 'Random']
const brandLinks = ['View All', 'Alphabetical', 'Newest', 'Featured', 'Popular', 'Random']
const categoryLinks = ['View All', 'Tops', 'Bottoms', 'Outerwear', 'Accessories', 'Footwear']
const designerLinks = ['View All', 'Trending', 'Spotlight', 'Lookbooks', 'Locations', 'Random']
const rankingLinks = ['Top Rated', 'Recently Liked', 'Most Liked', 'Leaderboard', 'Locations']

const MegaMenu = ({ category }: MegaMenuProps) => {
  const [showDiscoverMenu, setShowDiscoverMenu] = useState(false)
  const [showBrandsMenu, setShowBrandsMenu] = useState(false)
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false)
  const [showDesignersMenu, setShowDesignersMenu] = useState(false)
  const [showRankingsMenu, setShowRankingsMenu] = useState(false)

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="text-sm tracking-[0.25em] hover:text-gray-500 transition-colors">
        {category}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition duration-100 ease-out"
        enterFrom="transform translate-x-[-100%]"
        enterTo="transform translate-x-0"
        leave="transition duration-75 ease-out"
        leaveFrom="transform translate-x-0"
        leaveTo="transform translate-x-[-100%]"
      >
        <Menu.Items className="fixed left-0 top-[140px] h-[calc(100vh-156px)] w-[400px] bg-white z-[48]">
          {/* White overlay to hide the border lines */}
          <div className="absolute -top-[1px] left-0 right-0 h-[2px] bg-white z-[1004]" />
          
          <div className="relative h-full border-r border-black">
            {/* Content wrapper */}
            <div className="h-full flex flex-col">
              {/* Top Links */}
              <div className="flex-1 py-12">
                {topLinks.map((link) => (
                  <Menu.Item key={link}>
                    {({ active }) => (
                      <a
                        href="#"
                        className="block px-12 py-4 text-sm tracking-[0.25em] hover:text-gray-500 transition-colors"
                        onMouseEnter={() => {
                          if (link === 'Discover') setShowDiscoverMenu(true)
                          if (link === 'Brands') setShowBrandsMenu(true)
                          if (link === 'Categories') setShowCategoriesMenu(true)
                          if (link === 'Designers') setShowDesignersMenu(true)
                          if (link === 'Rankings') setShowRankingsMenu(true)
                        }}
                        onMouseLeave={() => {
                          if (link === 'Discover') setShowDiscoverMenu(false)
                          if (link === 'Brands') setShowBrandsMenu(false)
                          if (link === 'Categories') setShowCategoriesMenu(false)
                          if (link === 'Designers') setShowDesignersMenu(false)
                          if (link === 'Rankings') setShowRankingsMenu(false)
                        }}
                      >
                        {link}
                      </a>
                    )}
                  </Menu.Item>
                ))}
              </div>

              {/* Bottom Links */}
              <div className="py-8 mb-24">
                {bottomLinks.map((link) => (
                  <Menu.Item key={link}>
                    {({ active }) => (
                      <a
                        href="#"
                        className="block px-12 py-2 text-sm tracking-[0.25em] hover:text-gray-500 transition-colors"
                      >
                        {link}
                      </a>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </div>
          </div>
        </Menu.Items>
      </Transition>

      {/* Layer 2 - Discover Menu */}
      <Transition
        show={showDiscoverMenu}
        as={Fragment}
        enter="transition duration-100 ease-out"
        enterFrom="transform translate-x-[-100%]"
        enterTo="transform translate-x-0"
        leave="transition duration-75 ease-out"
        leaveFrom="transform translate-x-0"
        leaveTo="transform translate-x-[-100%]"
      >
        <div 
          className="fixed left-[400px] top-[140px] h-[calc(100vh-156px)] w-[400px] bg-white z-[47] border-r border-black"
          onMouseEnter={() => setShowDiscoverMenu(true)}
          onMouseLeave={() => setShowDiscoverMenu(false)}
        >
          <div className="py-12">
            {discoverLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="block px-12 py-4 text-sm tracking-[0.25em] hover:text-gray-500 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </Transition>

      {/* Layer 2 - Brands Menu */}
      <Transition
        show={showBrandsMenu}
        as={Fragment}
        enter="transition duration-100 ease-out"
        enterFrom="transform translate-x-[-100%]"
        enterTo="transform translate-x-0"
        leave="transition duration-75 ease-out"
        leaveFrom="transform translate-x-0"
        leaveTo="transform translate-x-[-100%]"
      >
        <div 
          className="fixed left-[400px] top-[140px] h-[calc(100vh-156px)] w-[400px] bg-white z-[47] border-r border-black"
          onMouseEnter={() => setShowBrandsMenu(true)}
          onMouseLeave={() => setShowBrandsMenu(false)}
        >
          <div className="py-12">
            {brandLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="block px-12 py-4 text-sm tracking-[0.25em] hover:text-gray-500 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </Transition>

      {/* Layer 2 - Categories Menu */}
      <Transition
        show={showCategoriesMenu}
        as={Fragment}
        enter="transition duration-100 ease-out"
        enterFrom="transform translate-x-[-100%]"
        enterTo="transform translate-x-0"
        leave="transition duration-75 ease-out"
        leaveFrom="transform translate-x-0"
        leaveTo="transform translate-x-[-100%]"
      >
        <div 
          className="fixed left-[400px] top-[140px] h-[calc(100vh-156px)] w-[400px] bg-white z-[47] border-r border-black"
          onMouseEnter={() => setShowCategoriesMenu(true)}
          onMouseLeave={() => setShowCategoriesMenu(false)}
        >
          <div className="py-12">
            {categoryLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="block px-12 py-4 text-sm tracking-[0.25em] hover:text-gray-500 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </Transition>

      {/* Layer 2 - Designers Menu */}
      <Transition
        show={showDesignersMenu}
        as={Fragment}
        enter="transition duration-100 ease-out"
        enterFrom="transform translate-x-[-100%]"
        enterTo="transform translate-x-0"
        leave="transition duration-75 ease-out"
        leaveFrom="transform translate-x-0"
        leaveTo="transform translate-x-[-100%]"
      >
        <div 
          className="fixed left-[400px] top-[140px] h-[calc(100vh-156px)] w-[400px] bg-white z-[47] border-r border-black"
          onMouseEnter={() => setShowDesignersMenu(true)}
          onMouseLeave={() => setShowDesignersMenu(false)}
        >
          <div className="py-12">
            {designerLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="block px-12 py-4 text-sm tracking-[0.25em] hover:text-gray-500 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </Transition>

      {/* Layer 2 - Rankings Menu */}
      <Transition
        show={showRankingsMenu}
        as={Fragment}
        enter="transition duration-100 ease-out"
        enterFrom="transform translate-x-[-100%]"
        enterTo="transform translate-x-0"
        leave="transition duration-75 ease-out"
        leaveFrom="transform translate-x-0"
        leaveTo="transform translate-x-[-100%]"
      >
        <div 
          className="fixed left-[400px] top-[140px] h-[calc(100vh-156px)] w-[400px] bg-white z-[47] border-r border-black"
          onMouseEnter={() => setShowRankingsMenu(true)}
          onMouseLeave={() => setShowRankingsMenu(false)}
        >
          <div className="py-12">
            {rankingLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="block px-12 py-4 text-sm tracking-[0.25em] hover:text-gray-500 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </Transition>
    </Menu>
  )
}

export default MegaMenu