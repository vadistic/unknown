import { Injectable, UseFilters } from '@nestjs/common'
import { Movie } from '@prisma/client'

import { mergeDefined } from '../../common/types/empty-keys'
import { OmdbResultType } from '../../module/omdb/omdb.interfaces'
import { OmdbService } from '../../module/omdb/omdb.service'
import { PrismaExceptionFilter } from '../../module/prisma/prisma-exception.filter'
import { PrismaService } from '../../module/prisma/prisma.service'

import { MovieCreateDto } from './dto/movie-create.dto'
import { MoviesFilterDto } from './dto/movie-filter.dto'
import { MovieIdInput } from './dto/movie-id.input'
import { MovieUpdateDto } from './dto/movie-update.dto'
import { MovieUpdateInput } from './dto/movie-update.input'
import { MOVIE_ERROR } from './movie.error'

@Injectable()
@UseFilters(PrismaExceptionFilter)
export class MovieService {
  constructor(readonly prisma: PrismaService, readonly omdbService: OmdbService) {}

  async findManyMovies({ take, skip, cursor, direction, orderBy, ...where }: MoviesFilterDto) {
    return await this.prisma.movie.findMany({
      skip,
      take,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: orderBy ? { [orderBy]: direction } : { createdAt: direction },
      where,
    })
  }

  async findOneMovie({ movieId }: MovieIdInput) {
    return await this.prisma.movie.findOne({
      where: { id: movieId },
    })
  }

  /** additional data from ombd api */
  async createMovie(data: MovieCreateDto) {
    const omdbMovie = await this.omdbService.getMovie({
      plot: 'short',
      // i: data.imdbID,
      t: data.title,
      type: data.type?.toLowerCase() as OmdbResultType,
    })

    // disallow adding movies that are not present on omdb
    if (!omdbMovie) {
      throw MOVIE_ERROR.NOT_ON_OMDB()
    }

    // ! throw on imdb id contraint fail
    try {
      const movie = await this.prisma.movie.create({
        data: mergeDefined<any, any>(omdbMovie, data),
      })

      return movie
    } catch (e) {
      throw MOVIE_ERROR.ALREADY_PRESENT()
    }
  }

  async updateMovie({ movieId, ...data }: MovieUpdateInput & MovieUpdateDto & MovieIdInput) {
    const movie = await this.prisma.comment.findOne({ where: { id: movieId } })

    if (!movie) {
      throw MOVIE_ERROR.NOT_FOUND()
    }

    return await this.prisma.movie.update({
      where: { id: movieId },
      data: { ...data, ratings: data.ratings as any }, // why typing issue?
    })
  }

  async deleteMovie({ movieId }: MovieIdInput) {
    const movie = await this.prisma.comment.findOne({ where: { id: movieId } })

    if (!movie) {
      throw MOVIE_ERROR.NOT_FOUND()
    }

    return await this.prisma.movie.delete({
      where: { id: movieId },
    })
  }

  // ────────────────────────────────────────────────────────────────────────────────

  // FIXME: this should be paginated
  async getRelatedComments(movie: Movie) {
    return await this.prisma.movie.findOne({ where: { id: movie.id } }).comments()
  }
}
