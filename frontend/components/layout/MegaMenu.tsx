'use client'
import { Fragment, useState, useEffect } from 'react'
import { Menu, Transition } from '@headlessui/react'
import Link from 'next/link'
import { hrefFor } from '@/lib/nav'

interface MegaMenuProps {
  category: string
}

const topLinks = ['Discover', 'Brands', 'Categories', 'Designers', 'Rankings']
const bottomLinks = ['Login', 'Liked', 'Saved', 'Submissions', 'About']
const discoverLinks = ['View All', 'Spotlight', 'Trending', 'Lookbooks', 'Location', 'Random']
const brandLinks = ['View All', 'Alphabetical', 'Newest', 'Featured', 'Popular', 'Random']
const categoryLinks = ['View All', 'Tops', 'Bottoms', 'Outerwear', 'Accessories', 'Footwear']
const designerLinks = ['View All', 'Trending', 'Spotlight', 'Lookbooks', 'Locations', 'Random']
const rankingLinks = ['View All', 'Top Rated', 'Recently Liked', 'Most Liked', 'Leaderboard', 'Locations']

const MegaMenu = ({ category }: MegaMenuProps) => {
  const [showDiscoverMenu, setShowDiscoverMenu] = useState(false)
  const [showBrandsMenu, setShowBrandsMenu] = useState(false)
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false)
  const [showDesignersMenu, setShowDesignersMenu] = useState(false)
  const [showRankingsMenu, setShowRankingsMenu] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLinkClick = (link: string) => {
    // Close all other menus first
    const closeAllExcept = (menuName: string) => {
      if (menuName !== 'Discover') setShowDiscoverMenu(false)
      if (menuName !== 'Brands') setShowBrandsMenu(false)
      if (menuName !== 'Categories') setShowCategoriesMenu(false)
      if (menuName !== 'Designers') setShowDesignersMenu(false)
      if (menuName !== 'Rankings') setShowRankingsMenu(false)
    }

    // Toggle the clicked menu and close others
    if (link === 'Discover') {
      closeAllExcept('Discover')
      setShowDiscoverMenu(!showDiscoverMenu)
    }
    if (link === 'Brands') {
      closeAllExcept('Brands')
      setShowBrandsMenu(!showBrandsMenu)
    }
    if (link === 'Categories') {
      closeAllExcept('Categories')
      setShowCategoriesMenu(!showCategoriesMenu)
    }
    if (link === 'Designers') {
      closeAllExcept('Designers')
      setShowDesignersMenu(!showDesignersMenu)
    }
    if (link === 'Rankings') {
      closeAllExcept('Rankings')
      setShowRankingsMenu(!showRankingsMenu)
    }
  }

  const to = (section: 'discover'|'brands'|'categories'|'designers'|'rankings', link: string) => hrefFor(section, category, link)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.menu-container')) {
        setShowDiscoverMenu(false)
        setShowBrandsMenu(false)
        setShowCategoriesMenu(false)
        setShowDesignersMenu(false)
        setShowRankingsMenu(false)
        setIsMenuOpen(false)
      }
    }

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDiscoverMenu(false)
        setShowBrandsMenu(false)
        setShowCategoriesMenu(false)
        setShowDesignersMenu(false)
        setShowRankingsMenu(false)
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [])

  useEffect(() => {
    if (!isMenuOpen) {
      setShowDiscoverMenu(false)
      setShowBrandsMenu(false)
      setShowCategoriesMenu(false)
      setShowDesignersMenu(false)
      setShowRankingsMenu(false)
    }
  }, [isMenuOpen])

  return (
    <Menu as="div" className="relative">
      {({ open }) => {
        if (open !== isMenuOpen) setIsMenuOpen(open)
        return (
          <>
            <Menu.Button aria-haspopup="true" aria-expanded={isMenuOpen} aria-label={`${category} menu`} className="text-sm tracking-[0.25em] hover:text-gray-500 transition-colors">
              {category}
            </Menu.Button>

            <div className="menu-container" role="presentation">
              <Transition
                show={isMenuOpen}
                as={Fragment}
                enter="transition duration-100 ease-out"
                enterFrom="transform translate-x-[-100%]"
                enterTo="transform translate-x-0"
                leave="transition duration-75 ease-out"
                leaveFrom="transform translate-x-0"
                leaveTo="transform translate-x-[-100%]"
              >
                <Menu.Items static className="fixed left-0 top-[104px] bottom-0 w-[400px] bg-white z-[48] overflow-y-auto">
                  {/* White overlay to hide the border lines */}
                  <div className="absolute -top-[1px] left-0 right-0 h-[2px] bg-white z-[1004]" />
                  
                  <div className="relative h-full border-r border-black">
                    {/* Content wrapper */}
                    <div className="min-h-full flex flex-col justify-between">
                      {/* Top Links */}
                      <div className="py-6">
                        {topLinks.map((link) => (
                          <Menu.Item key={link}>
                            {() => (
                              <a
                                href="#"
                                className="block px-12 py-4 text-sm tracking-[0.25em] hover:text-gray-500 transition-colors"
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleLinkClick(link)
                                }}
                                role="menuitem"
                                aria-haspopup="true"
                                aria-expanded={
                                  (link === 'Discover' && showDiscoverMenu) ||
                                  (link === 'Brands' && showBrandsMenu) ||
                                  (link === 'Categories' && showCategoriesMenu) ||
                                  (link === 'Designers' && showDesignersMenu) ||
                                  (link === 'Rankings' && showRankingsMenu)
                                    ? true
                                    : false
                                }
                              >
                                {link}
                              </a>
                            )}
                          </Menu.Item>
                        ))}
                      </div>

                      {/* Bottom Links */}
                      <div className="py-8">
                        {bottomLinks.map((link) => (
                          <Menu.Item key={link}>
                            {() => (
                              <Link
                                href={`/${link.toLowerCase().replace(' ', '-')}`}
                                className="block px-12 py-2 text-xs font-light tracking-[0.25em] hover:text-gray-500 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                                role="menuitem"
                              >
                                {link}
                              </Link>
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
                <div className="fixed left-[400px] top-[104px] bottom-0 w-[400px] bg-white z-[47] border-r border-black overflow-y-auto" role="menu" aria-label="Discover">
                  <div className="py-6">
                    {discoverLinks.map((link) => (
                      <Link
                        key={link}
                        href={to('discover', link)}
                        className="block px-12 py-4 text-sm tracking-[0.25em] hover:text-gray-500 transition-colors"
                        onClick={() => {
                          setShowDiscoverMenu(false)
                          setIsMenuOpen(false)
                        }}
                        role="menuitem"
                      >
                        {link}
                      </Link>
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
                <div className="fixed left-[400px] top-[104px] bottom-0 w-[400px] bg-white z-[47] border-r border-black overflow-y-auto" role="menu" aria-label="Brands">
                  <div className="py-6">
                    {brandLinks.map((link) => (
                      <Link
                        key={link}
                        href={to('brands', link)}
                        className="block px-12 py-4 text-sm tracking-[0.25em] hover:text-gray-500 transition-colors"
                        onClick={() => {
                          setShowBrandsMenu(false)
                          setIsMenuOpen(false)
                        }}
                        role="menuitem"
                      >
                        {link}
                      </Link>
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
                <div className="fixed left-[400px] top-[104px] bottom-0 w-[400px] bg-white z-[47] border-r border-black overflow-y-auto" role="menu" aria-label="Categories">
                  <div className="py-6">
                    {categoryLinks.map((link) => (
                      <Link
                        key={link}
                        href={to('categories', link)}
                        className="block px-12 py-4 text-sm tracking-[0.25em] hover:text-gray-500 transition-colors"
                        onClick={() => {
                          setShowCategoriesMenu(false)
                          setIsMenuOpen(false)
                        }}
                        role="menuitem"
                      >
                        {link}
                      </Link>
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
                <div className="fixed left-[400px] top-[104px] bottom-0 w-[400px] bg-white z-[47] border-r border-black overflow-y-auto" role="menu" aria-label="Designers">
                  <div className="py-6">
                    {designerLinks.map((link) => (
                      <Link
                        key={link}
                        href={to('designers', link)}
                        className="block px-12 py-4 text-sm tracking-[0.25em] hover:text-gray-500 transition-colors"
                        onClick={() => {
                          setShowDesignersMenu(false)
                          setIsMenuOpen(false)
                        }}
                        role="menuitem"
                      >
                        {link}
                      </Link>
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
                <div className="fixed left-[400px] top-[104px] bottom-0 w-[400px] bg-white z-[47] border-r border-black overflow-y-auto" role="menu" aria-label="Rankings">
                  <div className="py-6">
                    {rankingLinks.map((link) => (
                      <Link
                        key={link}
                        href={to('rankings', link)}
                        className="block px-12 py-4 text-sm tracking-[0.25em] hover:text-gray-500 transition-colors"
                        onClick={() => {
                          setShowRankingsMenu(false)
                          setIsMenuOpen(false)
                        }}
                        role="menuitem"
                      >
                        {link}
                      </Link>
                    ))}
                  </div>
                </div>
              </Transition>
            </div>
          </>
        )
      }}
    </Menu>
  )
}

export default MegaMenu